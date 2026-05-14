const features = [
  "SEO Audit Scanner",
  "Mobile Responsiveness Detection",
  "CTA Conversion Analysis",
  "Trust Signal Detection",
  "AI Copy Recommendations",
  "Performance & Speed Insights",
];

export default function FeatureGrid() {
  return (
    <section id="features" className="px-8 py-24 bg-white">
      <h2 className="section-title mb-14">Everything You Need In One Smart Audit</h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((item, i) => (
          <div key={i} className="glass-card rounded-3xl p-10 hover:-translate-y-2 transition">
            <h3 className="text-xl font-bold text-gray-900">{item}</h3>
            <p className="text-gray-500 mt-4 leading-7">
              Detailed AI generated recommendations, issue detection and direct
              implementation advice for higher conversion.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}