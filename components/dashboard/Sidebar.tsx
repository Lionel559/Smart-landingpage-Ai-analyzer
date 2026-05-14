"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ScanSearch,
  FileBarChart2,
  Settings,
  Sparkles,
  Activity,
  Shield,
  Menu,
  X,
} from "lucide-react";

import { useSession } from "next-auth/react";

export default function Sidebar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const workspaceName =
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "Workspace";

  const SidebarContent = () => (
    <>
      <div>
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Sparkles size={18} />
          </div>

          <div>
            <h1 className="text-[20px] font-bold text-gray-900">
              PageDoctor AI
            </h1>
            <p className="text-xs text-gray-400">
              AI Conversion Intelligence
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-4 rounded-2xl font-medium shadow-lg">
            <LayoutDashboard size={18} />
            Dashboard
          </div>

          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl text-gray-600 hover:bg-slate-100 cursor-pointer transition-all duration-300">
            <ScanSearch size={18} />
            New Audit
          </div>

          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl text-gray-600 hover:bg-slate-100 cursor-pointer transition-all duration-300">
            <FileBarChart2 size={18} />
            Audit Reports
          </div>

          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl text-gray-600 hover:bg-slate-100 cursor-pointer transition-all duration-300">
            <Settings size={18} />
            Settings
          </div>
        </nav>

        <div className="mt-10 rounded-[28px] bg-blue-50 border border-blue-100 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Activity size={16} className="text-blue-600" />
            AI Scan Engine
          </div>

          <div className="w-full h-3 rounded-full bg-blue-100 mt-4 overflow-hidden">
            <div className="w-[86%] h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          </div>

          <p className="text-xs text-gray-500 mt-3 leading-6">
            System operational and ready for live landing page analysis.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-xl">
          <p className="text-sm opacity-90 font-medium">
            Built by Lionel
          </p>

          <h3 className="text-3xl font-bold mt-3 leading-tight">
            Full Stack Developer
          </h3>

          <p className="text-sm mt-3 opacity-80 leading-6">
            Building premium AI-powered web experiences focused on responsive UI,
            polished dashboards and modern frontend systems.
          </p>

          <button
            onClick={() =>
              window.open("https://github.com/Lionel559", "_blank")
            }
            className="mt-5 bg-white text-blue-700 w-full py-3 rounded-2xl font-semibold hover:scale-[1.02] transition-all duration-300"
          >
            Hire Me
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 p-4 bg-white flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">
              {workspaceName} Workspace
            </p>

            <p className="text-xs text-gray-400 mt-1">
              AI Conversion Intelligence Dashboard
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Shield size={16} className="text-blue-600" />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* MOBILE TOP BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-900"
      >
        <Menu size={22} />
      </button>

      {/* MOBILE OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        className={`lg:hidden fixed top-0 left-0 w-[285px] max-w-[85vw] h-screen overflow-y-auto bg-white border-r border-gray-200 flex flex-col justify-between p-6 z-[80] transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-gray-700"
        >
          <X size={20} />
        </button>

        <SidebarContent />
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex fixed left-0 top-0 w-[270px] h-screen overflow-y-auto bg-white border-r border-gray-200 flex-col justify-between p-6 z-50">
        <SidebarContent />
      </aside>
    </>
  );
}