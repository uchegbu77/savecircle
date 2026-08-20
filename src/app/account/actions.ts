"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";

export type ProfileActionState = {
  error?: string;
  success?: string;
};

export type PasswordActionState = {
  error?: string;
  success?: string;
};

async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error(
      "You must be logged in.",
    );
  }

  const user =
    await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

  if (!user) {
    throw new Error(
      "User account not found.",
    );
  }

  return user;
}

export async function updateProfile(
  previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  try {
    const user =
      await getAuthenticatedUser();

    const firstName =
      formData
        .get("firstName")
        ?.toString()
        .trim() ?? "";

    const lastName =
      formData
        .get("lastName")
        ?.toString()
        .trim() ?? "";

    if (firstName.length < 2) {
      return {
        error:
          "First name must contain at least 2 characters.",
      };
    }

    if (lastName.length < 2) {
      return {
        error:
          "Last name must contain at least 2 characters.",
      };
    }

    if (
      firstName.length > 50 ||
      lastName.length > 50
    ) {
      return {
        error:
          "Names cannot exceed 50 characters.",
      };
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        firstName,
        lastName,
      },
    });

    revalidatePath("/account");
    revalidatePath("/dashboard");
    revalidatePath("/circles");
    revalidatePath("/notifications");
    revalidatePath("/reports");

    return {
      success:
        "Profile updated successfully.",
    };
  } catch (error) {
    console.error(
      "Failed to update profile:",
      error,
    );

    return {
      error:
        "Your profile could not be updated.",
    };
  }
}

export async function changePassword(
  previousState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  try {
    const user =
      await getAuthenticatedUser();

    const currentPassword =
      formData
        .get("currentPassword")
        ?.toString() ?? "";

    const newPassword =
      formData
        .get("newPassword")
        ?.toString() ?? "";

    const confirmPassword =
      formData
        .get("confirmPassword")
        ?.toString() ?? "";

    if (!currentPassword) {
      return {
        error:
          "Enter your current password.",
      };
    }

    if (!newPassword) {
      return {
        error:
          "Enter a new password.",
      };
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      return {
        error:
          "The new passwords do not match.",
      };
    }

    const passwordError =
      validatePassword(
        newPassword,
      );

    if (passwordError) {
      return {
        error:
          passwordError,
      };
    }

    const currentPasswordMatches =
      await bcrypt.compare(
        currentPassword,
        user.password,
      );

    if (
      !currentPasswordMatches
    ) {
      return {
        error:
          "Your current password is incorrect.",
      };
    }

    const sameAsCurrentPassword =
      await bcrypt.compare(
        newPassword,
        user.password,
      );

    if (
      sameAsCurrentPassword
    ) {
      return {
        error:
          "Your new password must be different from your current password.",
      };
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12,
      );

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        password:
          hashedPassword,
      },
    });

    revalidatePath("/account");

    return {
      success:
        "Password changed successfully.",
    };
  } catch (error) {
    console.error(
      "Failed to change password:",
      error,
    );

    return {
      error:
        "Your password could not be changed.",
    };
  }
}

function validatePassword(
  password: string,
) {
  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  if (password.length > 128) {
    return "Password cannot exceed 128 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }

  return null;
}