"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "../../lib/prisma";
import { validateRegistration } from "../../lib/validation";

export type RegisterState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function registerUser(
  previousState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const firstName =
    formData.get("firstName")?.toString() ?? "";

  const lastName =
    formData.get("lastName")?.toString() ?? "";

  const email =
    formData
      .get("email")
      ?.toString()
      .trim()
      .toLowerCase() ?? "";

  const password =
    formData.get("password")?.toString() ?? "";

  const confirmPassword =
    formData
      .get("confirmPassword")
      ?.toString() ?? "";

  const errors = validateRegistration({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  });

  if (Object.keys(errors).length > 0) {
    return {
      errors,
    };
  }

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (existingUser) {
    return {
      errors: {
        email:
          "An account with this email already exists.",
      },
    };
  }

  const hashedPassword =
    await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
      password: hashedPassword,
    },
  });

  redirect("/login?registered=true");
}