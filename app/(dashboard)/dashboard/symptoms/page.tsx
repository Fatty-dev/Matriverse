import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { SymptomLogger } from "@/components/symptoms/SymptomLogger";
import { getProfile } from "@/app/actions/profile";
import { getSymptoms, getSymptomStats } from "@/app/actions/symptoms";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default async function SymptomsPage() {
  const profile = await getProfile();
  const symptomsResult = await getSymptoms();
  const symptoms = symptomsResult.data || [];
  const stats = await getSymptomStats();

  return (
    <>
      <Header title="Symptom Tracker" profile={profile} />

      <main className="flex-1 px-8 sm:px-10 lg:px-12 py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Symptom Tracker</h1>
          <p className="text-text-muted">Log and monitor your pregnancy symptoms</p>
        </div>

        {/* Quick Log */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
          <CardHeader className="border-b-0 pb-2">
            <h3 className="text-lg font-semibold text-text">Quick Log</h3>
            <p className="text-sm text-text-muted">Tap to quickly log a symptom</p>
          </CardHeader>
          <CardContent>
            <SymptomLogger />
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">This Week</p>
                  <p className="text-3xl font-bold text-text">{stats.thisWeek}</p>
                  <p className="text-xs text-text-muted">symptoms logged</p>
                </div>
                <div className="p-3 rounded-xl bg-brand-surface text-brand-mid">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Most Common</p>
                  <p className="text-xl font-bold text-text">
                    {stats.mostCommon?.name || "None yet"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {stats.mostCommon ? `${stats.mostCommon.count} occurrences` : "Start logging"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10 text-warning">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Status</p>
                  <p className={`text-xl font-bold ${stats.hasMonitorStatus ? "text-warning" : "text-success"}`}>
                    {stats.hasMonitorStatus ? "Monitor" : "All Normal"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {stats.hasMonitorStatus ? "Some symptoms flagged" : "No concerns"}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stats.hasMonitorStatus ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Symptom History */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
          <CardHeader className="border-b-0">
            <div>
              <h3 className="text-lg font-semibold text-text">Recent Symptoms</h3>
              <p className="text-sm text-text-muted">Your symptom history</p>
            </div>
          </CardHeader>
          <CardContent>
            {symptoms.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-brand-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">No symptoms logged yet</h3>
                <p className="text-text-muted">Use the quick log above to start tracking your symptoms</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-text-muted border-b border-border">
                      <th className="pb-3 font-medium">Symptom</th>
                      <th className="pb-3 font-medium">Severity</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Time</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {symptoms.map((symptom) => (
                      <tr key={symptom.id} className="border-b border-border/50 last:border-0">
                        <td className="py-4">
                          <div>
                            <span className="font-medium text-text">{symptom.name}</span>
                            {symptom.notes && (
                              <p className="text-xs text-text-muted mt-0.5 truncate max-w-48">
                                {symptom.notes}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            symptom.severity === "mild" ? "bg-success/10 text-success" :
                            symptom.severity === "moderate" ? "bg-warning/10 text-warning" :
                            "bg-danger/10 text-danger"
                          }`}>
                            {symptom.severity.charAt(0).toUpperCase() + symptom.severity.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-text-muted">
                          {formatDate(symptom.logged_at)}
                        </td>
                        <td className="py-4 text-sm text-text-muted">
                          {formatTime(symptom.logged_at)}
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            symptom.status === "normal" ? "bg-success/10 text-success" :
                            symptom.status === "monitor" ? "bg-warning/10 text-warning" :
                            "bg-danger/10 text-danger"
                          }`}>
                            {symptom.status === "normal" ? "Normal" :
                             symptom.status === "monitor" ? "Monitor" : "Seek Care"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
