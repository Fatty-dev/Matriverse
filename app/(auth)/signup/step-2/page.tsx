import Link from "next/link";
import Image from "next/image";
import { Step2Form } from "@/components/auth/Step2Form";

export default function SignupStep2Page() {
  return (
    <>
      {/* Left Side - Image & Info */}
      <div className="relative hidden bg-brand-dark lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <span className="w-3 h-3 rounded-full bg-white" />
          </div>
          <span className="text-xl font-bold text-white">MatriVerse</span>
        </Link>

        {/* Center content */}
        <div className="flex flex-col items-center">
          <div className="w-80 h-80 xl:w-96 xl:h-96 relative mb-8">
            <Image
              src="/prenant-illus.svg"
              alt="Pregnancy illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl xl:text-4xl font-bold text-white text-center mb-4">
            Tell Us About You
          </h1>
          <p className="text-white/80 text-center max-w-md">
            Your personal details help us customize your experience and provide better support.
          </p>
        </div>

        {/* Spacer */}
        <div />
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-1 flex-col bg-white">
        {/* Mobile Header */}
        <div className="px-6 py-5 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-mid rounded-xl flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-white" />
            </div>
            <span className="text-xl font-bold text-brand-dark">MatriVerse</span>
          </Link>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-md">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-text-muted">Step 2 of 3</span>
              </div>
              <div className="flex gap-2">
                <div className="h-1 flex-1 rounded-full bg-brand-mid" />
                <div className="h-1 flex-1 rounded-full bg-brand-mid" />
                <div className="h-1 flex-1 rounded-full bg-border" />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold text-brand-dark">Personal Details</h2>
              <p className="text-text-muted">Tell us a bit about yourself</p>
            </div>

            <Step2Form />
          </div>
        </div>
      </div>
    </>
  );
}
