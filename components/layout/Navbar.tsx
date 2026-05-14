"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full px-10 py-6 flex items-center justify-between border-b border-gray-200 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        PageDoctor AI
      </h1>

      <div className="flex items-center gap-8 text-sm text-gray-600">
        <Link href="#features">Features</Link>
        <Link href="#pricing">Pricing</Link>
        <Link href="/login">Login</Link>
        <Link
          href="/register"
          className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:scale-105 transition"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}