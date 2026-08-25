"use client";

import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft, FaEnvelope, FaLock } from "react-icons/fa";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      <section className="relative w-full max-w-md rounded-[2rem] border border-border bg-surface p-6 shadow-2xl sm:p-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary"
        >
          <FaArrowLeft size={12} /> Back to login
        </Link>
        <div className="mt-8 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <FaLock />
        </div>
        <h1 className="mt-5 text-3xl font-black">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Enter your email and we’ll send instructions to recover your account.
        </p>
        {sent ? (
          <div className="mt-7 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
            If an account exists for <b>{email}</b>, password reset instructions have been
            requested.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="mt-7 space-y-4"
          >
            <label className="block text-sm font-semibold">
              Email address
              <div className="mt-2 flex h-12 items-center rounded-xl border border-border bg-background px-3 focus-within:border-primary">
                <FaEnvelope className="text-muted" size={14} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm text-text outline-none placeholder:text-muted"
                />
              </div>
            </label>
            <button className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover">
              Send reset instructions
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
