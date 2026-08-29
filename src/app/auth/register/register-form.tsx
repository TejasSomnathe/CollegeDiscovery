"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { registerSchema } from "@/lib/validations";
import { Spinner } from "@/components/ui/spinner";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Client-side validation using the shared schema
    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      return;
    }

    setLoading(true);

    // Step 1: Register via API
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: { message: string } };
      setErrors([data.error?.message ?? "Registration failed"]);
      setLoading(false);
      return;
    }

    // Step 2: Auto-sign-in after registration
    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.ok) {
      router.push("/");
      router.refresh();
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Arjun Sharma"
          required
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 chars, 1 uppercase, 1 number"
            required
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Must be at least 8 characters with one uppercase and one number
        </p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
          {errors.map((e) => (
            <p key={e} className="text-sm text-red-700">
              {e}
            </p>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
      >
        {loading && <Spinner className="w-4 h-4" />}
        Create Account
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
