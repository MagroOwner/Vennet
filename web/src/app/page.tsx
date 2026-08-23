import Link from "next/link";

const features = [
  {
    title: "Vennet Identity",
    body: "One trusted profile with a verification badge and a portable reputation score.",
    href: "/dashboard",
  },
  {
    title: "Reputation Engine",
    body: "Automatic scoring from real activity, with fraud-resistant rules and full history.",
    href: "/reputation",
  },
  {
    title: "Marketplace",
    body: "Buy and sell with Stripe-powered checkout, seller payouts, and dispute protection.",
    href: "/marketplace",
  },
  {
    title: "Verification",
    body: "Submit documents once and carry a verified badge across the platform.",
    href: "/verification",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="py-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Your identity. <span className="text-emerald-400">Your reputation.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
          Vennet is the trust layer for online commerce — verified identities,
          transparent reputation, and a marketplace built on both.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/marketplace"
            className="rounded-lg bg-emerald-600 px-6 py-3 font-medium hover:bg-emerald-500"
          >
            Browse marketplace
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-700 px-6 py-3 font-medium hover:bg-zinc-800"
          >
            Create your identity
          </Link>
        </div>
      </section>

      <section className="grid gap-6 py-8 sm:grid-cols-2">
        {features.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition hover:border-emerald-600"
          >
            <h2 className="text-xl font-semibold text-emerald-400">{f.title}</h2>
            <p className="mt-2 text-zinc-400">{f.body}</p>
          </Link>
        ))}
      </section>

      <section className="py-12 text-center">
        <h2 className="text-2xl font-semibold">Ready to go Pro?</h2>
        <p className="mt-2 text-zinc-400">
          Unlock priority placement, advanced analytics, and lower fees.
        </p>
        <Link
          href="/pro"
          className="mt-4 inline-block rounded-lg border border-emerald-600 px-6 py-2 font-medium text-emerald-400 hover:bg-emerald-600/10"
        >
          Upgrade to Vennet Pro
        </Link>
      </section>
    </div>
  );
}
