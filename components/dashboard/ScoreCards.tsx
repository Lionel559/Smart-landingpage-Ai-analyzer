"use client";

import { AuditDataType } from "@/components/dashboard/DashboardClient";
import {
  Search,
  UserCircle2,
  MousePointerClick,
  ShieldCheck,
  Smartphone,
  ScanSearch,
  AlertTriangle,
  Eye,
  Radar,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  auditData: AuditDataType | null;
};

const getLabel = (title: string, score: number) => {
  if (title === "SEO Intelligence") {
    if (score >= 70) return "Search visibility structurally healthy";
    if (score >= 45) return "Ranking depth can improve";
    return "Search acquisition leakage detected";
  }

  if (title === "UX Clarity") {
    if (score >= 70) return "Visitor flow relatively clean";
    if (score >= 45) return "Message friction present";
    return "UX confusion suppressing trust";
  }

  if (title === "CTA Persuasion") {
    if (score >= 70) return "Action prompts persuasive";
    if (score >= 45) return "CTA underleveraged";
    return "Conversion triggers weak";
  }

  if (title === "Trust Authority") {
    if (score >= 70) return "Credibility signals visible";
    if (score >= 45) return "Trust reinforcement needed";
    return "Cold visitor reassurance low";
  }

  if (title === "Mobile Conversion") {
    if (score >= 70) return "Mobile readiness healthy";
    if (score >= 45) return "Some handheld friction";
    return "Mobile usability leaking leads";
  }

  return "Moderate";
};

function AnimatedNumber({ value }: { value: number }) {
  const [count, setCount] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      setCount(value);
      return;
    }

    started.current = true;

    let current = 0;
    const duration = 700;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = value / steps;

    const timer = setInterval(() => {
      current += increment;

      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count}%</>;
}

export default function ScoreCards({ auditData }: Props) {
  const scores = [
    {
      title: "SEO Intelligence",
      value: auditData?.seo || 0,
      icon: <Search size={16} />,
    },
    {
      title: "UX Clarity",
      value: auditData?.ux || 0,
      icon: <UserCircle2 size={16} />,
    },
    {
      title: "CTA Persuasion",
      value: auditData?.cta || 0,
      icon: <MousePointerClick size={16} />,
    },
    {
      title: "Trust Authority",
      value: auditData?.trust || 0,
      icon: <ShieldCheck size={16} />,
    },
    {
      title: "Mobile Conversion",
      value: auditData?.mobile || 0,
      icon: <Smartphone size={16} />,
    },
  ];

  return (
    <div className="mt-10 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
      {scores.map((item, i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 120}ms` }}
          className="glass-card rounded-[28px] p-5 flex flex-col justify-between min-h-[185px] shadow-sm animate-fadeUp hover:-translate-y-1 transition-all duration-500"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            {item.icon}
          </div>

          <div>
            <h4 className="text-sm text-gray-500">{item.title}</h4>
            <p className="text-4xl font-bold text-gray-900 mt-2">
              <AnimatedNumber value={item.value} />
            </p>
          </div>

          <p className="text-[12px] leading-5 text-gray-500 font-medium">
            {getLabel(item.title, item.value)}
          </p>
        </div>
      ))}

      {auditData?.screenshotUrl && (
        <div className="relative overflow-hidden glass-card rounded-[28px] p-3 min-h-[185px] animate-fadeUp group">
          <img
            src={auditData.screenshotUrl}
            alt="preview"
            className="w-full h-[82px] object-cover rounded-xl"
          />

          <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Radar size={10} />
            LIVE AI SCAN
          </div>

          {/* pulse markers */}
          {auditData.heroWeak && (
            <div className="absolute left-4 top-10 border-2 border-red-500 w-16 h-8 rounded-md animate-pulse"></div>
          )}

          {!auditData.trustDetected && (
            <div className="absolute right-5 top-14 border-2 border-orange-400 w-12 h-6 rounded-md animate-pulse"></div>
          )}

          <div className="mt-3 space-y-1">
            {auditData.visualFlags?.slice(0, 2).map((flag, i) => (
              <div
                key={i}
                className="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded-full inline-flex items-center gap-1 mr-1"
              >
                <AlertTriangle size={10} />
                {flag}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <Eye size={12} />
            Visual consultant evidence
          </p>

          <p className="text-xs text-blue-600 font-semibold truncate">
            {auditData.siteUrl}
          </p>
        </div>
      )}
    </div>
  );
}