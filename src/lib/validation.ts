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