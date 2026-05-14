"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
  if (!fullName || !email || !password) {
    return alert("Please complete all fields");
  }

  setLoading(true);

  const registerRes = await fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: fullName,
      email,
      password,
    }),
  });

  const registerData = await registerRes.json();

  if (!registerRes.ok) {
    setLoading(false);
    return alert(registerData.error || "Registration failed");
  }

  const loginRes = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  setLoading(false);

  if (loginRes?.ok) {
    router.push("/dashboard");
  } else {
    alert("Account created but login failed");
  }
};

  const handleGoogle = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="glass-card w-full max-w-md rounded-[32px] p-8">
      <h2 className="text-3xl font-bold text-center">Create Account</h2>
      <p className="text-gray-500 text-center mt-2">Start auditing with PageDoctor AI</p>

      <div className="mt-8 space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Full name"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border outline-none"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="email"
            placeholder="Email address"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="password"
            placeholder="Password"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleRegister}
          className="w-full py-4 rounded-2xl bg-blue-600 text-white font-semibold"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <button
  onClick={handleGoogle}
  className="w-full py-4 rounded-2xl border flex items-center justify-center gap-3 font-medium bg-white hover:bg-gray-50 transition"
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