"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    return alert("Please enter email and password");
  }

  setLoading(true);

  try {
    const res = await signIn("credentials", {
      email: cleanEmail,
      password: cleanPassword,
      redirect: false,
    });

    setLoading(false);

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      alert("Invalid login credentials");
    }
  } catch (error) {
    setLoading(false);
    alert("Login failed");
    console.log(error);
  }
};

  const handleGoogle = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="glass-card w-full max-w-md rounded-[32px] p-8">
      <h2 className="text-3xl font-bold text-center">Welcome Back</h2>
      <p className="text-gray-500 text-center mt-2">Login to PageDoctor AI</p>

      <div className="mt-8 space-y-4">
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
          onClick={handleLogin}
          className="w-full py-4 rounded-2xl bg-blue-600 text-white font-semibold"
        >
          {loading ? "Logging in..." : "Login"}
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
          No account?{" "}
          <Link href="/register" className="text-blue-600 font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}