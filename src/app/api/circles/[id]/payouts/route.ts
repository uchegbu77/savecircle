import { auth } from "../../../../../auth";
import { prisma } from "../../../../../lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext,
) {
  const session =
    await auth();

  if (!session?.user?.email) {
    return new Response(
      "Unauthorised",
      {
        status: 401,
      },
    );
  }

  const { id } =
    await params;

  const circle =
    await prisma.savingsCircle.findFirst({
      where: {
        id,

        members: {
          some: {
            status:
              "ACTIVE",

            user: {
              email:
                session.user.email,
            },
          },
        },
      },

      include: {
        cycles: {
          where: {
            payoutStatus:
              "COMPLETED",
          },

          include: {
            payoutRecipient: {
              include: {
                user: true,
              },
            },
          },

          orderBy: {
            cycleNumber:
              "asc",
          },
        },
      },
    });

  if (!circle) {
    return new Response(
      "Circle not found",
      {
        status: 404,
      },
    );
  }

  const rows = [
    [
      "Circle",
      "Cycle",
      "Recipient",
      "Payout Amount",
      "Scheduled Date",
      "Completed Date",
      "Reference",
    ],

    ...circle.cycles.map(
      (cycle) => [
        circle.name,

        String(
          cycle.cycleNumber,
        ),

        `${cycle.payoutRecipient.user.firstName} ${cycle.payoutRecipient.user.lastName}`,

        Number(
          cycle.expectedAmount,
        ).toFixed(2),

        formatDate(
          cycle.scheduledDate,
        ),

        cycle.payoutCompletedAt
          ? formatDate(
              cycle.payoutCompletedAt,
            )
          : "",

        cycle.payoutReference ??
          "",
      ],
    ),
  ];

  const csv =
    rows
      .map((row) =>
        row
          .map(csvEscape)
          .join(","),
      )
      .join("\r\n");

  const fileName =
    `savecircle-${safeFileName(
      circle.name,
    )}-payouts.csv`;

  return new Response(
    csv,
    {
      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",

        "Content-Disposition":
          `attachment; filename="${fileName}"`,

        "Cache-Control":
          "no-store",
      },
    },
  );
}

function csvEscape(
  value: string,
) {
  return `"${value.replaceAll(
    '"',
    '""',
  )}"`;
}

function formatDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(date);
}

function safeFileName(
  value: string,
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}