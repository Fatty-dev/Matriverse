import Link from "next/link";
import Image from "next/image";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupStep1Page() {
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
              alt="Getting started illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl xl:text-4xl font-bold text-white text-center mb-4">
            Start Your Journey
          </h1>
          <p className="text-white/80 text-center max-w-md">
            Join thousands of mothers preparing for a safe and confident delivery.
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
                <span className="text-sm text-text-muted">Step 1 of 3</span>
              </div>
              <div className="flex gap-2">
                <div className="h-1 flex-1 rounded-full bg-brand-mid" />
                <div className="h-1 flex-1 rounded-full bg-border" />
                <div className="h-1 flex-1 rounded-full bg-border" />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold text-brand-dark">Create Account</h2>
              <p className="text-text-muted">Let&apos;s start with your basic information</p>
            </div>

            <SignupForm />
          </div>
        </div>
      </div>
    </>
  );
}
