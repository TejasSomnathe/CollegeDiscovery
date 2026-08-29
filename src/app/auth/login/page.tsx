import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-2">Sign in to access your saved colleges</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 rounded-xl" />}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="text-center text-sm text-slate-500 mt-4">
          Demo account:{" "}
          <span className="font-mono text-indigo-600">arjun@demo.com</span> /{" "}
          <span className="font-mono text-indigo-600">Demo@1234</span>
        </p>
      </div>
    </div>
  );
}
