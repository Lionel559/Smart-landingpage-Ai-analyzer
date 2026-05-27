import { BriefcaseBusiness, Code2, ExternalLink } from "lucide-react";

const footerLinks = [
  {
    label: "GitHub",
    href: "https://github.com/Lionel559/Smart-landingpage-Ai-analyzer",
    icon: Code2,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/lionel559",
    icon: BriefcaseBusiness,
  },
  {
    label: "Live Demo",
    href: "https://smart-landing-analyzer.vercel.app",
    icon: ExternalLink,
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-slate-100 px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">PageDoctor AI</h3>
          <p className="mt-3 max-w-xl text-gray-500">
            AI smart landing page analyzer for modern founders, marketers and
            agencies.
          </p>
          <p className="mt-3 text-xs leading-6 text-gray-400">
            AI audits are guidance and may not be 100% accurate.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 md:items-end">
          <div className="flex flex-wrap justify-center gap-3">
            {footerLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600"
              >
                <Icon size={16} />
                {label}
              </a>
            ))}
          </div>

          <a
            href="https://github.com/Lionel559"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Built by Lionel
          </a>
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-gray-400">
        (c) 2026 PageDoctor AI. All rights reserved.
      </p>
    </footer>
  );
}
