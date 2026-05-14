"use client";

import {
  Activity,
  BellDot,
  LogOut,
  UserCircle2,
  Sparkles,
} from "lucide-react";

import { useSession, signOut } from "next-auth/react";

export default function Topbar() {
  const { data: session } = useSession();

  const userName =
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "Consultant";

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10 pt-12 lg:pt-0 animate-fadeUp">
      {/* LEFT */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-3xl xl:text-4xl font-bold text-gray-900 tracking-[-1px]">
            Welcome back, {userName} 👋
          </h2>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>

            <span className="text-xs uppercase tracking-[0.15em] text-blue-700 font-semibold">
              AI Scanner Active
            </span>
          </div>
        </div>

        <p className="text-gray-500 mt-4 leading-7 max-w-2xl">
          Analyze landing pages, detect conversion leaks and generate
          AI-powered optimization recommendations in seconds.
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* INSIGHTS */}
        <div className="ui-card px-4 py-3 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <BellDot size={16} className="text-blue-600" />
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              Insights
            </p>

            <p className="text-sm font-semibold text-gray-900">
              3 New Findings
            </p>
          </div>
        </div>

        {/* USER */}
        <div className="ui-card px-4 py-3 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <UserCircle2 size={18} className="text-slate-700" />
          </div>

          <div className="max-w-[180px]">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              Account
            </p>

            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>

        {/* AI STATUS */}
        <div className="hidden md:flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <Sparkles size={16} />

          <span className="text-sm font-semibold">
            AI Consultant Mode
          </span>
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-5 py-3 rounded-2xl bg-white border border-gray-200 text-red-500 font-medium flex items-center gap-2 hover:border-red-200 hover:bg-red-50 transition-all duration-300"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}