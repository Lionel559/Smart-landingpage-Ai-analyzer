"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
        {/* LOGO */}
        <a href="/" className="text-2xl font-bold text-gray-900">
          PageDoctor <span className="text-blue-600">AI</span>
        </a>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
          <a href="#features" className="hover:text-blue-600 transition">
            Features
          </a>

          <a href="#pricing" className="hover:text-blue-600 transition">
            Pricing
          </a>

          <a href="/login" className="hover:text-blue-600 transition">
            Login
          </a>

          <a
            href="/register"
            className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Get Started
          </a>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden px-5 pb-6 bg-white border-t border-gray-100">
          <div className="flex flex-col gap-5 pt-5 text-gray-700 font-medium">
            <a href="#features" onClick={() => setOpen(false)}>
              Features
            </a>

            <a href="#pricing" onClick={() => setOpen(false)}>
              Pricing
            </a>

            <a href="/login" onClick={() => setOpen(false)}>
              Login
            </a>

            <a
              href="/register"
              className="bg-blue-600 text-white text-center py-3 rounded-xl"
              onClick={() => setOpen(false)}
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  );
}