"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  Camera,
  SearchCheck,
  Shield,
  MousePointerClick,
  BarChart3,
  Sparkles,
  BrainCircuit,
  Loader2,
  CheckCircle2,
} from "lucide-react";

type Props = {
  siteUrl: string;
};

const scanSteps = [
  {
    icon: <Globe size={18} />,
    title: "Connecting to live landing page",
    desc: "Fetching DOM architecture, metadata and render behavior...",
  },
  {
    icon: <Camera size={18} />,
    title: "Capturing visual screenshot intelligence",
    desc: "Rendering first fold desktop conversion frame...",
  },
  {
    icon: <SearchCheck size={18} />,
    title: "Scanning message hierarchy & SEO signals",
    desc: "Evaluating copy structure, headings and clarity leakage...",
  },
  {
    icon: <MousePointerClick size={18} />,
    title: "Running CTA persuasion diagnostics",
    desc: "Checking urgency triggers, visual CTA prominence and action flow...",
  },
  {
    icon: <Shield size={18} />,
    title: "Trust credibility inspection",
    desc: "Measuring trust badges, proof acceleration and skepticism friction...",
  },
  {
    icon: <BarChart3 size={18} />,
    title: "Calculating revenue opportunity score",
    desc: "Generating consultant CRO model and conversion confidence...",
  },
];

export default function AuditLoader({ siteUrl }: Props) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));

      setProgress((prev) => {
        if (prev >= 96) return 96;
        return prev + 2;
      });
    }, 850);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ui-card rounded-[40px] p-8 md:p-10 mt-8 relative overflow-hidden animate-revealScale border-pulse">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-100 blur-[130px] rounded-full opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-indigo-100 blur-[130px] rounded-full opacity-70"></div>

      <div className="absolute inset-0 shimmer-bar opacity-40"></div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-sm font-semibold border border-blue-100">
          <Sparkles size={14} />
          PageDoctor AI Forensic Consultant Running
        </div>

        <div className="flex items-center justify-center mt-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl float-glow">
              <BrainCircuit size={34} />
            </div>

            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 pulse-dot"></div>
          </div>
        </div>

        <h3 className="text-center text-3xl md:text-4xl font-bold text-gray-900 mt-7">
          Running Deep Conversion Intelligence Audit
        </h3>

        <p className="text-center text-gray-500 mt-3 text-base">
          Diagnosing revenue leaks across:
          <span className="text-blue-600 font-semibold ml-2">
            {siteUrl || "samplelandingpage.com"}
          </span>
        </p>

        <div className="mt-9 max-w-[720px] mx-auto">
          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Consultant diagnostic progress</span>
            <span>{progress}%</span>
          </div>
        </div>

        <div className="mt-10 max-w-[780px] mx-auto space-y-4">
          {scanSteps.map((item, i) => (
            <div
              key={i}
              className={`rounded-[26px] px-5 py-4 border transition-all duration-500 flex gap-4 items-start ${
                i <= step
                  ? "bg-white border-blue-100 shadow-md opacity-100"
                  : "bg-slate-50 border-gray-100 opacity-45"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  i < step
                    ? "bg-green-500 text-white"
                    : i === step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {i < step ? <CheckCircle2 size={18} /> : item.icon}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>

              {i === step && (
                <Loader2 className="animate-spin text-blue-600 mt-1" size={18} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}