import { Header } from "@/components/layout";
import { getProfile } from "@/app/actions/profile";
import { getReports } from "@/app/actions/reports";
import { ReportsClient } from "@/components/reports";

export default async function ReportsPage() {
  const profile = await getProfile();
  const reportsResult = await getReports();
  const reports = reportsResult.success ? reportsResult.data || [] : [];

  return (
    <>
      <Header title="Reports" profile={profile} />

      <main className="flex-1 px-8 sm:px-10 lg:px-12 py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Reports</h1>
          <p className="text-text-muted">Download and manage your pregnancy reports</p>
        </div>

        <ReportsClient initialReports={reports} />
      </main>
    </>
  );
}
