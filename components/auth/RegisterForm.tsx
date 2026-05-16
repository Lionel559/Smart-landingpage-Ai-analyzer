"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleRegister = async () => {
    setErrorMsg("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Please complete all fields.");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (password.trim().length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setErrorMsg(registerData.error || "Registration failed.");
        return;
      }

      const loginRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        redirect: false,
      });

      if (loginRes?.ok) {
        router.push("/dashboard");
      } else {
        setErrorMsg("Account created, but login failed. Please login manually.");
      }
    } catch (error) {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="glass-card w-full max-w-md rounded-[32px] p-8">
      <h2 className="text-3xl font-bold text-center text-gray-900">
        Create Account
      </h2>

      <p className="text-gray-500 text-center mt-2">
        Start auditing with PageDoctor AI
      </p>

      <div className="mt-8 space-y-4">
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm flex gap-2 items-start">
            <AlertCircle size={17} className="mt-[1px] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="relative">
          <User
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Full name"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border outline-none"
            value={fullName}
            disabled={loading}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="relative">
          <Mail
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            type="email"
            placeholder="Email address"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border outline-none"
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative">
          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border outline-none"
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-blue-600 text-white font-semibold disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-4 rounded-2xl border flex items-center justify-center gap-3 font-medium bg-white hover:bg-gray-50 transition disabled:opacity-60"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />

          Continue with Google
        </button>

        <p className="text-sm text-center text-gray-500">
          Already have account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}