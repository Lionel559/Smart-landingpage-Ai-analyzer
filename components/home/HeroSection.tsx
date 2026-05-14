export default function HeroSection() {
  return (
    <section className="relative px-8 py-28 text-center overflow-hidden soft-bg">
      <div className="hero-glow top-10 left-20"></div>
      <div className="hero-glow bottom-0 right-10"></div>

      <div className="relative z-10">
        <span className="px-5 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
          AI Conversion Intelligence Platform
        </span>

        <h1 className="text-6xl font-bold max-w-5xl mx-auto leading-tight mt-8 text-gray-900">
          Analyze Any Landing Page And Discover Why Visitors Are Not Converting
        </h1>

        <p className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg leading-8">
          Instantly scan SEO structure, responsiveness, CTA effectiveness, trust
          signals, UX mistakes and AI copywriting issues with one click.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <a
            href="/register"
            className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg"
          >
            Analyze My Site
          </a>

          <a
            href="#features"
            className="px-8 py-4 rounded-2xl border border-gray-300 bg-white"
          >
            See Features
          </a>
        </div>
      </div>
    </section>
  );
}