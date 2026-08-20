"use client";

import {
  useActionState,
  useState,
} from "react";

import {
  changePassword,
  type PasswordActionState,
} from "../app/account/actions";

const initialState: PasswordActionState =
  {};

export default function ChangePasswordForm() {
  const [
    showPasswords,
    setShowPasswords,
  ] = useState(false);

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    changePassword,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      <PasswordField
        id="currentPassword"
        name="currentPassword"
        label="Current password"
        autoComplete="current-password"
        showPassword={showPasswords}
      />

      <PasswordField
        id="newPassword"
        name="newPassword"
        label="New password"
        autoComplete="new-password"
        showPassword={showPasswords}
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
        showPassword={showPasswords}
      />

      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-700">
          Your new password must:
        </p>

        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          <li>
            • Have at least 8 characters
          </li>

          <li>
            • Include an uppercase letter
          </li>

          <li>
            • Include a lowercase letter
          </li>

          <li>
            • Include at least one number
          </li>
        </ul>
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={showPasswords}
          onChange={(event) =>
            setShowPasswords(
              event.target.checked,
            )
          }
          className="h-4 w-4 accent-emerald-600"
        />

        Show passwords
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Changing password..."
          : "Change password"}
      </button>
    </form>
  );
}

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  autoComplete:
    | "current-password"
    | "new-password";
  showPassword: boolean;
};

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  showPassword,
}: PasswordFieldProps) {
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
        type={
          showPassword
            ? "text"
            : "password"
        }
        required
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}