import { Header } from "@/components/layout";
import { getProfile } from "@/app/actions/profile";
import { getScans } from "@/app/actions/scans";
import { ScansClient } from "@/components/scans";
import { OnboardingScanPrompt } from "@/components/scans/OnboardingScanPrompt";

interface ScansPageProps {
  searchParams: Promise<{ onboarding?: string }>;
}

export default async function ScansPage({ searchParams }: ScansPageProps) {
  const params = await searchParams;
  const isOnboarding = params.onboarding === "true";
  const profile = await getProfile();
  const scansResult = await getScans();
  const scans = scansResult.success ? scansResult.data || [] : [];
  const hasUploadedScan = profile?.has_uploaded_scan || scans.length > 0;

  return (
    <>
      <Header title="My Scans" profile={profile} />

      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        {/* Onboarding Banner */}
        {isOnboarding && !hasUploadedScan && (
          <OnboardingScanPrompt />
        )}

        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text">My Scans</h1>
              <p className="text-sm sm:text-base text-text-muted">Upload and view your ultrasound scans and medical images</p>
            </div>
          </div>
        </div>

        <ScansClient initialScans={scans} isOnboarding={isOnboarding} />
      </main>
    </>
  );
}
