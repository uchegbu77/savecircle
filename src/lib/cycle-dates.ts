type ContributionFrequency =
  | "WEEKLY"
  | "MONTHLY";

/**
 * Returns the scheduled date for a cycle.
 *
 * Cycle 1 uses the circle's original start date.
 * Later cycles are weekly or monthly intervals from it.
 */
export function getCycleDate(
  startDate: Date,
  frequency: ContributionFrequency,
  cycleIndex: number,
) {
  if (
    !Number.isInteger(cycleIndex) ||
    cycleIndex < 0
  ) {
    throw new Error(
      "Cycle index must be a non-negative integer.",
    );
  }

  if (frequency === "WEEKLY") {
    return addUtcDays(
      startDate,
      cycleIndex * 7,
    );
  }

  return addUtcMonthsClamped(
    startDate,
    cycleIndex,
  );
}

function addUtcDays(
  date: Date,
  numberOfDays: number,
) {
  const result = new Date(date);

  result.setUTCDate(
    result.getUTCDate() + numberOfDays,
  );

  return result;
}

/**
 * Adds months while preventing dates such as 31 January
 * from unexpectedly rolling into March.
 */
function addUtcMonthsClamped(
  date: Date,
  numberOfMonths: number,
) {
  const originalDay =
    date.getUTCDate();

  const firstDayOfTargetMonth =
    new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth() +
          numberOfMonths,
        1,
      ),
    );

  const lastDayOfTargetMonth =
    new Date(
      Date.UTC(
        firstDayOfTargetMonth.getUTCFullYear(),
        firstDayOfTargetMonth.getUTCMonth() +
          1,
        0,
      ),
    ).getUTCDate();

  firstDayOfTargetMonth.setUTCDate(
    Math.min(
      originalDay,
      lastDayOfTargetMonth,
    ),
  );

  return firstDayOfTargetMonth;
}