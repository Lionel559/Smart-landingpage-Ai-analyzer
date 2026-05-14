export default function CTASection() {
  return (
    <section className="px-8 py-24 bg-white text-center">
      <div className="max-w-4xl mx-auto glass-card rounded-[40px] p-16">
        <h2 className="text-5xl font-bold text-gray-900 leading-tight">
          Ready To Discover What Is Blocking Your Conversion?
        </h2>

        <p className="text-gray-500 mt-6 text-lg leading-8">
          Run your first AI powered landing page diagnosis in less than 60 seconds.
        </p>

        <a
          href="/register"
          className="inline-block mt-10 px-10 py-4 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg"
        >
          Start Free Audit
        </a>
      </div>
    </section>
  );
}