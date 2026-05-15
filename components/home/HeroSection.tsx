export default function HeroSection() {
  return (
    <section className="relative overflow-hidden soft-bg px-5 sm:px-8 py-20 sm:py-24 lg:py-28 text-center">
      <div className="hero-glow top-10 left-20"></div>
      <div className="hero-glow bottom-0 right-10"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <span className="inline-block px-4 sm:px-5 py-2 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold">
          AI Conversion Intelligence Platform
        </span>

        <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 max-w-5xl mx-auto">
          Analyze Any Landing Page And Discover Why Visitors Are Not Converting
        </h1>

        <p className="text-gray-500 mt-6 max-w-2xl mx-auto text-base sm:text-lg leading-7 sm:leading-8">
          Instantly scan SEO structure, responsiveness, CTA effectiveness,
          trust signals, UX mistakes and AI copywriting issues with one click.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="/register"
            className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            Analyze My Site
          </a>

          <a
            href="#features"
            className="px-8 py-4 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-300"
          >
            See Features
          </a>
        </div>
      </div>
    </section>
  );
}