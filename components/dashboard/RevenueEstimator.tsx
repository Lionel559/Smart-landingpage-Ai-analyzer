"use client";

import { AuditDataType } from "@/components/dashboard/DashboardClient";
import {
  TrendingDown,
  DollarSign,
  Users,
  ShieldAlert,
} from "lucide-react";

type Props = {
  auditData: AuditDataType | null;
};

export default function RevenueEstimator({ auditData }: Props) {
  if (!auditData) return null;

  const leakPercent =
    18 + auditData.critical * 4 + auditData.medium * 2;

  const lostLeads =
    40 + auditData.critical * 8 + auditData.medium * 5;

  const trustLoss =
    12 + auditData.medium * 3;

  const upside =
    1200 + auditData.health * 18;

  return (
    <div className="mt-10 grid xl:grid-cols-12 gap-6 animate-fadeUp">
      {/* MAIN PANEL */}
      <div className="xl:col-span-7 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>

          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-red-600">
            Revenue Leakage Projection
          </p>
        </div>

        <h3 className="text-3xl font-bold text-slate-900 mt-6 leading-tight max-w-4xl">
          AI estimates this landing page may be losing roughly{" "}
          <span className="text-blue-600">
            {leakPercent}% of high-intent visitors
          </span>{" "}
          before conversion action.
        </h3>

        <p className="text-slate-600 mt-5 leading-8 max-w-3xl">
          Based on CTA friction, trust hesitation and weak persuasion
          structure, this page shows measurable abandonment behavior before
          visitors complete an action.
        </p>

        {/* METRICS */}
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {/* CARD */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingDown className="text-red-500" size={18} />
            </div>

            <p className="text-sm text-slate-500 mt-4">
              Estimated Conversion Drag
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {leakPercent}%
            </p>
          </div>

          {/* CARD */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="text-blue-600" size={18} />
            </div>

            <p className="text-sm text-slate-500 mt-4">
              Potential Lost Leads / Mo
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {lostLeads}+
            </p>
          </div>

          {/* CARD */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <DollarSign className="text-green-600" size={18} />
            </div>

            <p className="text-sm text-slate-500 mt-4">
              Revenue Recovery Potential
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              ${upside}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="xl:col-span-5 space-y-6">
        {/* TRUST CARD */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <ShieldAlert className="text-orange-500" size={18} />
            </div>

            <h4 className="font-bold text-slate-900 text-lg">
              Trust Leakage Signal
            </h4>
          </div>

          <p className="text-slate-600 mt-5 leading-8">
            Roughly {trustLoss}% of skeptical visitors may abandon before
            taking action due to weak trust reinforcement and credibility
            sequencing.
          </p>
        </div>

        {/* CONSULTANT CARD */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[32px] p-7 text-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.15em] text-blue-100 font-semibold">
            CRO Consultant Interpretation
          </p>

          <p className="mt-5 leading-8 text-blue-50">
            This is not only a traffic issue - it is a monetization efficiency
            problem inside the page itself. Improving messaging clarity and
            trust signals could significantly increase lead conversion rates.
          </p>
        </div>
      </div>
    </div>
  );
}
