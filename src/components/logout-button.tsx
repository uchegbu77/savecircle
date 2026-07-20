import { signOut } from "../auth";

export default function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";

        await signOut({
          redirectTo: "/",
        });
      }}
    >
      <button
        type="submit"
        className="w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
      >
        Log out
      </button>
    </form>
  );
}