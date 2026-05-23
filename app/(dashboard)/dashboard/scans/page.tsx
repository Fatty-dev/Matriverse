import { Header } from "@/components/layout";
import { getProfile } from "@/app/actions/profile";
import { getScans } from "@/app/actions/scans";
import { ScansClient } from "@/components/scans";

export default async function ScansPage() {
  const profile = await getProfile();
  const scansResult = await getScans();
  const scans = scansResult.success ? scansResult.data || [] : [];

  return (
    <>
      <Header title="My Scans" profile={profile} />

      <main className="flex-1 px-8 sm:px-10 lg:px-12 py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text">My Scans</h1>
              <p className="text-text-muted">Upload and view your ultrasound scans and medical images</p>
            </div>
          </div>
        </div>

        <ScansClient initialScans={scans} />
      </main>
    </>
  );
}
