"use client";

import { useFormStatus } from "react-dom";

type ConfirmSubmitButtonProps = {
  children: React.ReactNode;
  confirmationMessage: string;
  pendingText?: string;
  variant?: "danger" | "warning";
};

export default function ConfirmSubmitButton({
  children,
  confirmationMessage,
  pendingText = "Working...",
  variant = "danger",
}: ConfirmSubmitButtonProps) {
  const { pending } =
    useFormStatus();

  function handleClick(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    if (pending) {
      event.preventDefault();
      return;
    }

    const confirmed =
      window.confirm(
        confirmationMessage,
      );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  const style =
    variant === "danger"
      ? "border-red-200 text-red-600 hover:bg-red-50"
      : "border-amber-200 text-amber-700 hover:bg-amber-50";

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={handleClick}
      className={`rounded-lg border bg-white px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${style}`}
    >
      {pending
        ? pendingText
        : children}
    </button>
  );
}