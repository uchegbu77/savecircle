"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingText?: string;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
};

export default function SubmitButton({
  children,
  pendingText = "Saving...",
  variant = "primary",
  className = "",
}: SubmitButtonProps) {
  const { pending } =
    useFormStatus();

  const styles = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700",

    secondary:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",

    danger:
      "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  };

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`rounded-lg px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
    >
      {pending
        ? pendingText
        : children}
    </button>
  );
}