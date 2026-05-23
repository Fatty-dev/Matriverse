import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg">
      <h1 className="text-4xl font-bold text-brand-dark mb-8">
        This is the landing page
      </h1>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-brand-mid text-white rounded-lg font-medium hover:bg-brand-dark transition-colors"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-6 py-3 border border-brand-mid text-brand-mid rounded-lg font-medium hover:bg-brand-surface transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
