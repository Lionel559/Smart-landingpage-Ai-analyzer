type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-slate-100">
      <div className="hidden md:flex flex-col justify-center px-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <h1 className="text-5xl font-bold leading-tight">
          PageDoctor AI helps founders fix low converting landing pages.
        </h1>

        <p className="mt-8 text-lg text-blue-100 leading-8 max-w-xl">
          AI generated UX analysis, SEO diagnosis, trust signal detection and
          conversion recommendations trusted by agencies and growth marketers.
        </p>

        <div className="mt-12 space-y-4 text-blue-100">
          <p>✓ Instant URL scanning</p>
          <p>✓ AI generated implementation advice</p>
          <p>✓ Exportable client reports</p>
          <p>✓ Mobile responsiveness detection</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-8 py-12">
        <div className="glass-card rounded-[35px] p-12 w-full max-w-md">
          <h2 className="text-4xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 mt-3 mb-10">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}