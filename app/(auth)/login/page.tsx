import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

interface LoginPageProps {
  searchParams: Promise<{ registered?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const justRegistered = params.registered === "true";

  return (
    <>
      {/* Left Side - Image & Info (Fixed) */}
      <div className="fixed inset-y-0 left-0 hidden bg-brand-dark lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16">
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
              src="/login.svg"
              alt="MatriVerse illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl xl:text-4xl font-bold text-white text-center mb-4">
            Welcome Back
          </h1>
          <p className="text-white/80 text-center max-w-md">
            Continue your pregnancy journey with personalized guidance and support.
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
            <div className="w-10 h-10 bg-brand-mid rounded-xl flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-white" />
            </div>
            <span className="text-xl font-bold text-brand-dark">MatriVerse</span>
          </Link>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-md">
            {justRegistered && (
              <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-xl">
                <p className="text-success text-sm font-medium">
                  Registration complete! Please sign in with your credentials.
                </p>
              </div>
            )}

            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold text-brand-dark">Sign In</h2>
              <p className="text-text-muted">Enter your credentials to continue</p>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </>
  );
}
