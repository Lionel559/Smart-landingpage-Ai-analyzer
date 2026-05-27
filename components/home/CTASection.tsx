export default function CTASection() {
  return (
    <section className="px-5 sm:px-8 py-16 sm:py-24 bg-white text-center">
      <div className="max-w-4xl mx-auto glass-card rounded-[28px] sm:rounded-[40px] p-8 sm:p-12 lg:p-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
          Ready To Discover What Is Blocking Your Conversion?
        </h2>

        <p className="text-gray-500 mt-5 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 max-w-2xl mx-auto">
          Run your first AI powered landing page diagnosis in less than 60 seconds.
        </p>

        <a
          href="/register"
          className="inline-block mt-8 sm:mt-10 px-8 sm:px-10 py-4 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition-all duration-300"
        >
          Start Free Audit
        </a>

        <p className="mx-auto mt-5 max-w-xl text-xs leading-6 text-gray-400">
          AI audits are guidance and may not be 100% accurate.
        </p>
      </div>
    </section>
  );
}
