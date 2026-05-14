const plans = [
  {
    name: "Free",
    desc: "2 smart audits every month",
    price: "$0",
  },
  {
    name: "Pro",
    desc: "Unlimited audits + PDF export + AI deep report",
    price: "$29",
  },
  {
    name: "Agency",
    desc: "White label reports + client sharing + team access",
    price: "$79",
  },
];

export default function PricingPreview() {
  return (
    <section id="pricing" className="px-8 py-24 bg-slate-50">
      <h2 className="section-title mb-4">Simple Pricing For Every Team</h2>
      <p className="text-center text-gray-500 mb-14">
        Scale from personal audits to full client reporting.
      </p>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <div
            key={i}
            className="glass-card rounded-3xl p-10 text-center hover:-translate-y-2 transition"
          >
            <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
            <p className="text-5xl font-bold text-blue-600 mt-5">{plan.price}</p>
            <p className="text-gray-500 mt-4 leading-7">{plan.desc}</p>

            <button className="mt-8 px-7 py-3 rounded-2xl bg-blue-600 text-white font-semibold">
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}