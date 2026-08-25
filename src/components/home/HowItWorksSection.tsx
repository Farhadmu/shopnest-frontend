"use client";

interface Step {
  num: string;
  title: string;
  desc: string;
}

const steps: Step[] = [
  { num: "01", title: "Discover", desc: "Browse products, categories and trusted stores." },
  { num: "02", title: "Decide with AI", desc: "Compare options and get a recommendation." },
  { num: "03", title: "Buy with confidence", desc: "Checkout, track and review your order." },
];

export default function HowItWorksSection() {
  return (
    <section className="rounded-[2rem] bg-muted-bg p-7 text-text sm:p-10">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[.2em] text-primary">
          Simple by design
        </p>
        <h2 className="mt-2 text-3xl font-black text-text sm:text-4xl">How ShopNest works</h2>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map(({ num, title, desc }) => (
          <div
            key={num}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
          >
            <span className="text-sm font-black text-primary">{num}</span>
            <h3 className="mt-8 text-xl font-black text-text">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}