export type RegistrationData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function validateRegistration(
  data: RegistrationData,
) {
  const errors: Record<string, string> = {};

  if (data.firstName.trim().length < 2) {
    errors.firstName =
      "First name must contain at least 2 characters.";
  }

  if (data.lastName.trim().length < 2) {
    errors.lastName =
      "Last name must contain at least 2 characters.";
  }

  if (!data.email.includes("@")) {
    errors.email =
      "Enter a valid email address.";
  }

  if (data.password.length < 8) {
    errors.password =
      "Password must contain at least 8 characters.";
  }

  if (
    data.password !== data.confirmPassword
  ) {
    errors.confirmPassword =
      "Passwords do not match.";
  }

  return errors;
}

export type CreateCircleData = {
  name: string;
  description: string;
  contributionAmount: string;
  frequency: string;
  startDate: string;
};

export function validateCreateCircle(
  data: CreateCircleData,
) {
  const errors: Record<string, string> = {};

  if (data.name.trim().length < 3) {
    errors.name =
      "Circle name must contain at least 3 characters.";
  }

  const amount =
    Number(data.contributionAmount);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    errors.contributionAmount =
      "Enter a valid contribution amount.";
  }

  if (
    data.frequency !== "WEEKLY" &&
    data.frequency !== "MONTHLY"
  ) {
    errors.frequency =
      "Select a valid contribution frequency.";
  }

  if (!data.startDate) {
    errors.startDate =
      "Select a start date.";
  }

  return errors;
}

export function validateInviteCode(
  inviteCode: string,
) {
  const code = inviteCode
    .trim()
    .toUpperCase();

  if (!code) {
    return "Enter an invite code.";
  }

  if (code.length !== 8) {
    return "Invite codes must contain 8 characters.";
  }

  return null;
}