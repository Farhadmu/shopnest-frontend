import {
  FaCheckCircle,
  FaComments,
  FaShieldAlt,
  FaUserCheck,
} from "react-icons/fa";

const trustFeatures = [
  {
    icon: FaUserCheck,
    title: "Strict Merchant Vetting",
    description:
      "Every seller goes through a verification process before joining the ShopNest marketplace.",
  },
  {
    icon: FaShieldAlt,
    title: "Escrow Protection",
    description:
      "Your payment stays protected until your order is successfully completed.",
  },
  {
    icon: FaComments,
    title: "Direct Store Dialogue",
    description:
      "Communicate directly with sellers and get answers about products and orders.",
  },
  {
    icon: FaCheckCircle,
    title: "Verified Buyer Reviews",
    description:
      "Make better decisions with authentic reviews from verified ShopNest buyers.",
  },
];

export default function TrustStandard() {
  return (
    <section className="bg-white py-16 dark:bg-slate-900 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <FaShieldAlt />
            ShopNest Trust Standard
          </div>

          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            The ShopNest Trust Standard
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
            We work hard to make every shopping experience safer, more
            transparent and more trustworthy for our customers.
          </p>
        </div>

        {/* Trust Cards */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900"
              >
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 transition-transform duration-300 group-hover:scale-110 dark:bg-blue-500/10">
                  <Icon className="text-xl text-blue-600 dark:text-blue-400" />
                </div>

                {/* Title */}
                <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}