import Link from "next/link";
import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { getProfile } from "@/app/actions/profile";
import { getARStats } from "@/app/actions/ar-training";
import { getSymptoms } from "@/app/actions/symptoms";
import { getScans } from "@/app/actions/scans";
import type { Profile } from "@/types";

function calculatePregnancyStats(profile: Profile | null) {
  let currentWeek = 0;
  let daysToDue = 0;

  if (profile?.due_date) {
    const due = new Date(profile.due_date);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    daysToDue = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const weeksRemaining = Math.ceil(daysToDue / 7);
    currentWeek = Math.max(1, Math.min(42, 40 - weeksRemaining));
  }

  return { currentWeek, daysToDue };
}

export default async function DashboardPage() {
  const profile = await getProfile();
  const arStats = await getARStats();
  const symptomsResult = await getSymptoms();
  const scansResult = await getScans();

  const symptoms = symptomsResult.data || [];
  const scans = scansResult.data || [];
  const { currentWeek, daysToDue } = calculatePregnancyStats(profile);
  const firstName = profile?.first_name || "there";

  // Get recent symptoms (last 5)
  const recentSymptoms = symptoms.slice(0, 5);

  return (
    <>
      <Header title="Dashboard" profile={profile} />

      <main className="flex-1 px-8 sm:px-10 lg:px-12 py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Welcome back, {firstName}!</h1>
          <p className="text-text-muted">Here is your pregnancy journey summary</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-muted mb-1">Current Week</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text">{currentWeek > 0 ? currentWeek : "--"}</span>
                <span className="text-sm text-text-muted">weeks</span>
              </div>
              <p className="text-xs text-text-muted mt-1">Gestational Age</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-muted mb-1">Days to Due</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text">{daysToDue > 0 ? daysToDue : "--"}</span>
                <span className="text-sm text-text-muted">days</span>
              </div>
              <p className="text-xs text-text-muted mt-1">Estimated Delivery</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-muted mb-1">Training Sessions</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text">{arStats.totalSessions}</span>
                <span className="text-sm text-text-muted">total</span>
              </div>
              <p className="text-xs text-text-muted mt-1">{arStats.totalReps} reps completed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-text-muted mb-1">Scans Uploaded</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text">{scans.length}</span>
                <span className="text-sm text-text-muted">files</span>
              </div>
              <p className="text-xs text-text-muted mt-1">Medical images stored</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent AR Training Sessions */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardHeader className="border-b-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text">Recent Training Sessions</h3>
                  <p className="text-sm text-text-muted">Your AR training history</p>
                </div>
                <Link href="/dashboard/ar-trainer" className="text-sm text-brand-mid hover:text-brand-dark font-medium">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {arStats.recentSessions && arStats.recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {arStats.recentSessions.slice(0, 4).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-brand-surface/30 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-mid/10 text-brand-mid flex items-center justify-center">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-text capitalize">{session.session_type.replace('_', ' ')}</p>
                          <p className="text-sm text-text-muted">
                            {new Date(session.started_at).toLocaleDateString()} • {Math.floor((session.duration_seconds || 0) / 60)}m
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-text">{session.total_reps} reps</p>
                          <p className={`text-sm ${
                            (session.avg_form_score || 0) >= 80 ? 'text-green-500' :
                            (session.avg_form_score || 0) >= 60 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {Math.round(session.avg_form_score || 0)}% form
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-text-muted mb-4">No training sessions yet</p>
                  <Link href="/dashboard/ar-trainer">
                    <button className="px-4 py-2 bg-brand-mid text-white rounded-lg font-medium hover:bg-brand-dark transition-colors">
                      Start Training
                    </button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardHeader className="border-b-0">
              <div>
                <h3 className="text-lg font-semibold text-text">Quick Actions</h3>
                <p className="text-sm text-text-muted">Access key features</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/dashboard/ar-trainer">
                  <div className="flex items-center gap-4 p-4 bg-brand-surface/50 rounded-xl hover:bg-brand-surface transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-brand-mid text-white flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">AR Training</p>
                      <p className="text-xs text-text-muted">Start a session</p>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/symptoms">
                  <div className="flex items-center gap-4 p-4 bg-info/5 rounded-xl hover:bg-info/10 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-info text-white flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">Log Symptoms</p>
                      <p className="text-xs text-text-muted">Track how you feel</p>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/scans">
                  <div className="flex items-center gap-4 p-4 bg-success/5 rounded-xl hover:bg-success/10 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-success text-white flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">Upload Scan</p>
                      <p className="text-xs text-text-muted">Add medical images</p>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/reports">
                  <div className="flex items-center gap-4 p-4 bg-warning/5 rounded-xl hover:bg-warning/10 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-warning text-white flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">Generate Report</p>
                      <p className="text-xs text-text-muted">Download your data</p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Symptoms */}
        <Card className="mt-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
          <CardHeader className="border-b-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text">Recent Symptoms</h3>
                <p className="text-sm text-text-muted">Latest symptoms you've logged</p>
              </div>
              <Link href="/dashboard/symptoms" className="text-sm text-brand-mid hover:text-brand-dark font-medium">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentSymptoms.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-text-muted border-b border-border/50">
                      <th className="pb-3 font-medium">Symptom</th>
                      <th className="pb-3 font-medium">Severity</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSymptoms.map((symptom) => (
                      <tr key={symptom.id} className="border-b border-border/30 hover:bg-brand-surface/20 transition-colors">
                        <td className="py-4 text-sm font-medium text-text capitalize">
                          {symptom.name}
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            symptom.severity === 'severe' ? 'bg-red-100 text-red-700' :
                            symptom.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {symptom.severity}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-text-muted">
                          {new Date(symptom.logged_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-sm text-text-muted">
                          {symptom.notes ? (
                            <span className="line-clamp-1">{symptom.notes}</span>
                          ) : (
                            <span className="text-text-muted/50">No notes</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-text-muted mb-4">No symptoms logged yet</p>
                <Link href="/dashboard/symptoms">
                  <button className="px-4 py-2 bg-brand-mid text-white rounded-lg font-medium hover:bg-brand-dark transition-colors">
                    Log Your First Symptom
                  </button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
