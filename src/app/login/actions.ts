"use server";

import { AuthError } from "next-auth";

import { signIn } from "../../auth";

export type LoginState = {
  error?: string;
};

export async function loginUser(
  previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email =
    formData
      .get("email")
      ?.toString()
      .trim()
      .toLowerCase() ?? "";

  const password =
    formData.get("password")?.toString() ?? "";

  if (!email || !password) {
    return {
      error:
        "Enter your email address and password.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "The email address or password is incorrect.",
      };
    }

    throw error;
  }
}