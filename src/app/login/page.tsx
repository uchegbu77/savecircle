import { redirect } from "next/navigation";

import { auth } from "../../auth";

import Link from "next/link";
import LoginForm from "../../components/login-form";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";

type LoginPageProps = {
  searchParams: Promise<{
    registered?: string;
  }>;
};

export default async function LoginPage({searchParams,}: LoginPageProps) {
  const params = await searchParams;
  const session = await auth();

if (session?.user) {
  redirect("/dashboard");
}
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back
            </h1>

            <p className="mt-3 text-slate-600">
              Log in to manage your savings circles.
            </p>
          </div>

          {params.registered === "true" && (
            <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
              Your account was created successfully.
              You can now log in.
            </div>
          )}

          <LoginForm />

          <p className="mt-6 text-center text-sm text-slate-600">
            Do not have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Create one
            </Link>
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}