"use client";

import { useActionState } from "react";

import {
  registerUser,
  type RegisterState,
} from "../app/register/actions";

const initialState: RegisterState = {};

export default function RegisterForm() {
  const [state, formAction, pending] =
    useActionState(
      registerUser,
      initialState,
    );

  return (
    <form
      action={formAction}
      className="mt-8 space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="firstName"
          name="firstName"
          label="First name"
          placeholder="Obiora"
          autoComplete="given-name"
          error={state.errors?.firstName}
        />

        <FormField
          id="lastName"
          name="lastName"
          label="Last name"
          placeholder="Uche"
          autoComplete="family-name"
          error={state.errors?.lastName}
        />
      </div>

      <FormField
        id="email"
        name="email"
        label="Email address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={state.errors?.email}
      />

      <FormField
        id="password"
        name="password"
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        error={state.errors?.password}
      />

      <FormField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        type="password"
        placeholder="Enter your password again"
        autoComplete="new-password"
        error={state.errors?.confirmPassword}
      />

      {state.message && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          required
          className="mt-1 h-4 w-4 accent-emerald-600"
        />

        <span>
          I agree to the SaveCircle terms and privacy policy.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Creating account..."
          : "Create account"}
      </button>
    </form>
  );
}

type FormFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
};

function FormField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  error,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`mt-2 w-full rounded-lg border px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        }`}
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}