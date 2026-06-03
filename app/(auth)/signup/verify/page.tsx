import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { VerifyOTPForm } from "@/components/auth/VerifyOTPForm";

interface VerifyPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { email } = await searchParams;

  if (!email) {
    redirect("/signup");
  }

  return (
    <>
      {/* Left Side - Image & Info (Fixed) */}
      <div className="fixed inset-y-0 left-0 hidden bg-brand-dark lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/matriverse_logo_white.png" alt="MatriVerse" className="h-14" />
          <span className="text-xl font-bold text-white">MatriVerse</span>
        </Link>

        {/* Center content */}
        <div className="flex flex-col items-center">
          <div className="w-80 h-80 xl:w-96 xl:h-96 relative mb-8">
            <Image
              src="/first.svg"
              alt="Email verification illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl xl:text-4xl font-bold text-white text-center mb-4">
            Check Your Email
          </h1>
          <p className="text-white/80 text-center max-w-md">
            We&apos;ve sent a verification code to your email address.
          </p>
        </div>

        {/* Spacer */}
        <div />
      </div>

      {/* Right Side - Form (Scrollable) */}
      <div className="flex flex-1 flex-col bg-white lg:ml-[50%] min-h-screen overflow-y-auto">
        {/* Mobile Header */}
        <div className="px-6 py-5 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-3">
            <img src="/matriverse_logo_purple.png" alt="MatriVerse" className="h-14" />
            <span className="text-xl font-bold text-brand-dark">MatriVerse</span>
          </Link>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-md">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-text-muted">Verify Email</span>
              </div>
              <div className="flex gap-2">
                <div className="h-1 flex-1 rounded-full bg-brand-mid/50" />
                <div className="h-1 flex-1 rounded-full bg-border" />
                <div className="h-1 flex-1 rounded-full bg-border" />
              </div>
            </div>

            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-brand-mid"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-3xl font-bold text-brand-dark">
                Verify Your Email
              </h2>
              <p className="text-text-muted">
                Enter the 6-digit code sent to
              </p>
              <p className="font-medium text-brand-dark">{email}</p>
            </div>

            <VerifyOTPForm email={email} />

            <div className="mt-6 text-center">
              <Link
                href="/signup"
                className="text-sm text-text-muted hover:text-brand-mid"
              >
                ← Back to signup
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
