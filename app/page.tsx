import Link from "next/link";
import { TimeGreeting } from "@/components/time-greeting";
import { ResponsiveHeader } from "@/components/responsive-header";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <ResponsiveHeader
        links={[
          { href: "#how-it-works", label: "How it works" },
          { href: "#why-drop2earn", label: "Why Drop2Earn" },
          { href: "#climate-community", label: "Climate & community" },
          { href: "/login", label: "Get Started" },
        ]}
      />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold text-green-700">
          <TimeGreeting />
        </p>
        <div className="mb-6 inline-flex rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          ♻️ Building Zambia&apos;s circular economy
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Turn recyclable waste into
            <span className="text-green-600"> value.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Drop2Earn connects waste collectors, collection points and
            recycling businesses through a digital platform that makes
            recyclable waste collection traceable, measurable and rewarding.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="rounded-lg bg-green-600 px-6 py-3.5 font-semibold text-white shadow-sm hover:bg-green-700"
            >
              Start collecting
            </Link>

            <a
              href="#how-it-works"
              className="rounded-lg border border-gray-300 px-6 py-3.5 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Learn how it works
            </a>
          </div>
        </div>
      </section>

      {/* Climate and community */}
      <section id="climate-community" className="overflow-hidden bg-gray-50 px-6 py-20 text-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                <span aria-hidden="true" className="text-base">✦</span>
                Climate &amp; community
              </div>
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                A cleaner community is part of a healthier climate.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600">
                Every bottle recovered, every collection verified and every
                kilogram kept in circulation is a small act of climate care.
                Drop2Earn helps turn those acts into visible, shared progress
                for people and the places they call home.
              </p>
              <a
                href="https://www.unep.org/news-and-stories"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                Explore climate stories
                <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="relative">
              <div aria-hidden="true" className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-green-100 blur-3xl" />
              <div aria-hidden="true" className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-100 blur-3xl" />
              <div className="relative grid gap-4 sm:grid-cols-2">
                {[
                  {
                    eyebrow: "Learn",
                    title: "Climate news & insight",
                    text: "Follow reporting and science from trusted global climate organisations.",
                    href: "https://climate.nasa.gov/news/",
                    label: "Read climate news",
                    accent: "bg-blue-100 text-blue-700",
                  },
                  {
                    eyebrow: "Act",
                    title: "Make impact visible",
                    text: "Choose reuse, recover materials and support the people doing the work.",
                    href: "#how-it-works",
                    label: "See how it works",
                    accent: "bg-green-100 text-green-700",
                  },
                  {
                    eyebrow: "Connect",
                    title: "Local action matters",
                    text: "Cleaner streets, stronger livelihoods and healthier communities reinforce each other.",
                    href: "/login",
                    label: "Join Drop2Earn",
                    accent: "bg-yellow-100 text-yellow-800",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:last:col-span-2"
                  >
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${card.accent}`}>
                      {card.eyebrow}
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-gray-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{card.text}</p>
                    <a
                      href={card.href}
                      target={card.href.startsWith("http") ? "_blank" : undefined}
                      rel={card.href.startsWith("http") ? "noreferrer" : undefined}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800"
                    >
                      {card.label}
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform value */}
      <section id="why-drop2earn" className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
              WHY DROP2EARN
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              Make every kilogram count.
            </h2>
            <p className="mt-5 leading-7 text-gray-600">
              Drop2Earn gives people and businesses a shared record of
              recyclable materials, from the moment they are collected to the
              moment they are verified, purchased and paid for.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Traceable", "Know where materials came from and where they go."],
              ["Fairer earnings", "Base payouts on verified weight, not estimates."],
              ["Local impact", "Support cleaner communities and local livelihoods."],
              ["Reliable supply", "Help recyclers find verified materials to process."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l4 4L19 6" />
                  </svg>
                </div>
                <h3 className="mt-4 font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For everyone in the value chain */}
      <section className="bg-green-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            BUILT FOR THE VALUE CHAIN
          </p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            One platform, different roles.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["Collectors", "Record what you recover, follow verification and track your earnings."],
              ["Collection points", "Verify actual weights and keep community collections organised."],
              ["Recyclers", "Discover verified supply, reserve materials and manage handoffs."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl bg-white p-7 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <p className="mt-3 leading-7 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="font-semibold text-green-600">HOW IT WORKS</p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              From collection to recycling.
            </h2>

            <p className="mt-4 text-gray-600">
              Every recyclable-material collection becomes a verified digital
              transaction.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Collect",
                text: "Collectors recover recyclable materials from communities and collection areas.",
              },
              {
                number: "02",
                title: "Verify",
                text: "Collection points verify the material type and actual weight.",
              },
              {
                number: "03",
                title: "Earn & Recycle",
                text: "Verified collections are recorded, rewarded and connected to recycling businesses.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-gray-200 bg-white p-7"
              >
                <div className="text-sm font-bold text-green-600">
                  {step.number}
                </div>

                <h3 className="mt-4 text-xl font-bold text-gray-900">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core value */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-600">
            VERIFIED COLLECTIONS
          </p>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            One digital record for every collection.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-gray-600">
            Who collected it. What was collected. How much. Where. When.
            Verification. Payment. Buyer.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              "Collector",
              "Material",
              "Weight",
              "Location",
              "Verification",
              "Payment",
              "Buyer",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Drop2Earn</p>
          <p>Digital infrastructure for Zambia&apos;s recycling value chain.</p>
        </div>
      </footer>
    </main>
  );
}