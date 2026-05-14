const stats = [
  ["10K+", "Landing Pages Analyzed"],
  ["92%", "Conversion Insight Accuracy"],
  ["500+", "Agencies Using Platform"],
  ["24/7", "AI Audit Availability"],
];

export default function StatsStrip() {
  return (
    <section className="px-8 py-14 bg-gray-50 border-y border-gray-200">
      <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
        {stats.map((stat, i) => (
          <div key={i}>
            <h3 className="text-4xl font-bold text-blue-600">{stat[0]}</h3>
            <p className="text-gray-500 mt-2">{stat[1]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}