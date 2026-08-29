import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Create your account</h1>
          <p className="text-slate-500 mt-2">Start discovering and saving colleges today</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
