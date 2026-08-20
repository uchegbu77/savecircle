import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return new Response(
      "Unauthorised",
      {
        status: 401,
      },
    );
  }

  const user =
    await prisma.user.findUnique({
      where: {
        email:
          session.user.email,
      },

      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

  if (!user) {
    return new Response(
      "User not found",
      {
        status: 404,
      },
    );
  }

  const contributions =
    await prisma.contribution.findMany({
      where: {
        member: {
          userId: user.id,
        },
      },

      include: {
        cycle: {
          include: {
            savingsCircle: true,

            payoutRecipient: {
              include: {
                user: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const rows = [
    [
      "Circle",
      "Cycle",
      "Scheduled Date",
      "Contribution Status",
      "Amount Due",
      "Amount Paid",
      "Outstanding",
      "Paid Date",
      "Payout Recipient",
    ],

    ...contributions.map(
      (contribution) => {
        const amountDue =
          Number(
            contribution.amountDue,
          );

        const amountPaid =
          Number(
            contribution.amountPaid,
          );

        const outstanding =
          Math.max(
            0,
            amountDue -
              amountPaid,
          );

        const recipient =
          `${contribution.cycle.payoutRecipient.user.firstName} ${contribution.cycle.payoutRecipient.user.lastName}`;

        return [
          contribution.cycle
            .savingsCircle.name,

          String(
            contribution.cycle
              .cycleNumber,
          ),

          formatCsvDate(
            contribution.cycle
              .scheduledDate,
          ),

          contribution.status,

          amountDue.toFixed(2),

          amountPaid.toFixed(2),

          outstanding.toFixed(2),

          contribution.paidAt
            ? formatCsvDate(
                contribution.paidAt,
              )
            : "",

          recipient,
        ];
      },
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
    `savecircle-contributions-${formatFileDate(
      new Date(),
    )}.csv`;

  return new Response(csv, {
    status: 200,

    headers: {
      "Content-Type":
        "text/csv; charset=utf-8",

      "Content-Disposition":
        `attachment; filename="${fileName}"`,

      "Cache-Control":
        "no-store",
    },
  });
}

function csvEscape(
  value: string,
) {
  const escaped =
    value.replaceAll(
      '"',
      '""',
    );

  return `"${escaped}"`;
}

function formatCsvDate(
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

function formatFileDate(
  date: Date,
) {
  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1,
    ).padStart(2, "0"),
    String(
      date.getDate(),
    ).padStart(2, "0"),
  ].join("-");
}