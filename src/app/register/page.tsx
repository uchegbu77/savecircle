
import { redirect } from "next/navigation";

import { auth } from "../../auth";
import Link from "next/link";
import RegisterForm from "../../components/register-form";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
  redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              Create your account
            </h1>

            <p className="mt-3 text-slate-600">
              Join SaveCircle and organise your group savings.
            </p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-slate-600">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Log in
            </Link>
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}