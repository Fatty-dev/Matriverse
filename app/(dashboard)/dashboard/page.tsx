import Link from "next/link";
import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { NutritionTipCard } from "@/components/dashboard/NutritionTipCard";
import { getProfile } from "@/app/actions/profile";
import { getARStats } from "@/app/actions/ar-training";
import { getSymptoms } from "@/app/actions/symptoms";
import { getScans } from "@/app/actions/scans";
import { getTodaysMoodEntry } from "@/app/actions/mood";
import type { Profile, MedicalHistoryItem } from "@/types";

function calculatePregnancyStats(profile: Profile | null) {
  let currentWeek = 0;
  let daysToDue = 0;
  let trimester = 0;

  if (profile?.due_date) {
    const due = new Date(profile.due_date);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    daysToDue = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const weeksRemaining = Math.ceil(daysToDue / 7);
    currentWeek = Math.max(1, Math.min(42, 40 - weeksRemaining));

    // Calculate trimester
    if (currentWeek <= 12) trimester = 1;
    else if (currentWeek <= 26) trimester = 2;
    else trimester = 3;
  }

  return { currentWeek, daysToDue, trimester };
}

function getTrimesterRecommendations(trimester: number, medicalHistory: MedicalHistoryItem[] | null) {
  const recommendations: { title: string; description: string; link: string; icon: string }[] = [];

  // Base recommendations by trimester
  if (trimester === 1) {
    recommendations.push(
      { title: "Gentle Breathing", description: "Start with calming exercises", link: "/dashboard/breathing", icon: "heart" },
      { title: "Track Symptoms", description: "Monitor early pregnancy signs", link: "/dashboard/symptoms", icon: "clipboard" },
    );
  } else if (trimester === 2) {
    recommendations.push(
      { title: "Labor Education", description: "Watch preparation videos", link: "/dashboard/videos", icon: "video" },
      { title: "AR Training", description: "Begin position practice", link: "/dashboard/ar-trainer", icon: "exercise" },
    );
  } else if (trimester === 3) {
    recommendations.push(
      { title: "Labour Rehearsal", description: "Practice for your D-Day", link: "/dashboard/rehearsal", icon: "lightning" },
      { title: "Breathing Mastery", description: "Perfect your technique", link: "/dashboard/breathing", icon: "heart" },
      { title: "AI Coach", description: "Get personalized guidance", link: "/dashboard/ai-coach", icon: "chat" },
    );
  }

  // Add medical history specific recommendations
  if (medicalHistory && medicalHistory.length > 0) {
    const conditions = medicalHistory.filter(m => m.selected).map(m => m.condition);

    if (conditions.includes('Gestational Diabetes') || conditions.includes('Diabetes')) {
      recommendations.push({ title: "Track Symptoms", description: "Monitor blood sugar related symptoms", link: "/dashboard/symptoms", icon: "clipboard" });
    }
    if (conditions.includes('Hypertension') || conditions.includes('Pre-eclampsia')) {
      recommendations.push({ title: "Symptom Tracking", description: "Monitor blood pressure symptoms", link: "/dashboard/symptoms", icon: "clipboard" });
    }
  }

  return recommendations.slice(0, 3); // Return max 3 recommendations
}

interface DashboardPageProps {
  searchParams: Promise<{ welcome?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const isNewUser = params.welcome === "true";

  const profile = await getProfile();
  const arStats = await getARStats();
  const symptomsResult = await getSymptoms();
  const scansResult = await getScans();
  const todayMood = await getTodaysMoodEntry();

  const symptoms = symptomsResult.data || [];
  const scans = scansResult.data || [];
  const hasMoodToday = todayMood.success && todayMood.data;
  const { currentWeek, daysToDue, trimester } = calculatePregnancyStats(profile);
  const firstName = profile?.first_name || "there";
  const recommendations = getTrimesterRecommendations(trimester, profile?.medical_history || null);

  // Get recent symptoms (last 5)
  const recentSymptoms = symptoms.slice(0, 5);

  return (
    <>
      <Header title="Dashboard" profile={profile} />

      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        {/* New User Welcome Banner */}
        {isNewUser && (
          <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-brand-mid to-brand-accent border-0 shadow-xl overflow-hidden">
            <CardContent className="p-5 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome to MatriVerse, {firstName}!</h2>
                  <p className="opacity-90 mb-4 text-sm sm:text-base">Your personalized pregnancy journey starts here. We&apos;re here to help you prepare for your special day.</p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Link href="/dashboard/scans" className="px-4 py-2 bg-white text-brand-mid rounded-lg font-medium hover:bg-white/90 transition-colors text-center text-sm sm:text-base">
                      Upload Your First Scan
                    </Link>
                    <Link href="/dashboard/videos" className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors text-center text-sm sm:text-base">
                      Explore Videos
                    </Link>
                  </div>
                </div>
                <div className="hidden lg:block text-8xl opacity-30">
                  <span>&#128118;</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-text">Welcome back, {firstName}!</h1>
          <p className="text-text-muted text-sm sm:text-base">
            {trimester > 0
              ? `Trimester ${trimester} • Week ${currentWeek} of your pregnancy journey`
              : "Track your pregnancy journey and prepare for your special day"}
          </p>
        </div>

        {/* D-Day Countdown - Prominent Section */}
        {daysToDue > 0 && (
          <Card className="mb-6 sm:mb-8 bg-gradient-to-br from-brand-dark via-brand-mid to-brand-accent border-0 shadow-xl overflow-hidden">
            <CardContent className="p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-white/80 text-xs sm:text-sm font-medium mb-1">YOUR D-DAY COUNTDOWN</p>
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <span className="text-4xl sm:text-6xl font-bold text-white">{daysToDue}</span>
                    <span className="text-lg sm:text-xl text-white/80">days to go</span>
                  </div>
                  <p className="text-white/70 mt-2 text-sm sm:text-base">
                    {daysToDue <= 30
                      ? "Almost there! Focus on your labour preparation exercises."
                      : daysToDue <= 60
                        ? "Getting closer! Time to intensify your training."
                        : "You are doing great! Keep Preparing."}
                  </p>
                  {/* Mobile-only week and button */}
                  <div className="flex items-center gap-4 mt-4 sm:hidden">
                    <div className="text-white/90">
                      <span className="text-sm">Week </span>
                      <span className="text-2xl font-bold">{currentWeek}</span>
                    </div>
                    <Link
                      href="/dashboard/rehearsal"
                      className="px-4 py-2 bg-white text-brand-mid rounded-lg font-medium hover:bg-white/90 transition-colors text-sm"
                    >
                      Start Rehearsal
                    </Link>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-center gap-2">
                  <div className="text-white/90 text-center">
                    <p className="text-sm">Week</p>
                    <p className="text-4xl font-bold">{currentWeek}</p>
                  </div>
                  <Link
                    href="/dashboard/rehearsal"
                    className="mt-2 px-4 py-2 bg-white text-brand-mid rounded-lg font-medium hover:bg-white/90 transition-colors text-sm"
                  >
                    Start Rehearsal
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Mood Check-in */}
        {!hasMoodToday && (
          <Card className="mb-6 sm:mb-8 bg-white/90 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-3xl sm:text-4xl">&#128522;</div>
                  <div>
                    <h3 className="font-semibold text-text text-sm sm:text-base">How are you feeling today?</h3>
                    <p className="text-xs sm:text-sm text-text-muted">Take a moment to check in with yourself</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/mood"
                  className="px-4 py-2 bg-brand-mid text-white rounded-lg font-medium hover:bg-brand-dark transition-colors text-center text-sm sm:text-base"
                >
                  <button className="text-white">
                  Log Mood
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Nutrition Tip Flipbook */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-text mb-3 sm:mb-4">
            Weekly Nutrition Tip
          </h2>
          <NutritionTipCard currentWeek={currentWeek} />
        </div>

        {/* Trimester-Based Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold text-text mb-3 sm:mb-4">
              Recommended for {trimester === 3 ? "Your Final Trimester" : `Trimester ${trimester}`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {recommendations.map((rec, index) => (
                <Link key={index} href={rec.link}>
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer h-full">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 rounded-xl bg-brand-surface text-brand-mid flex items-center justify-center mb-3">
                        {rec.icon === "heart" && (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        )}
                        {rec.icon === "clipboard" && (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        )}
                        {rec.icon === "video" && (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                        {rec.icon === "exercise" && (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {rec.icon === "lightning" && (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        {rec.icon === "chat" && (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        )}
                      </div>
                      <h3 className="font-semibold text-text mb-1">{rec.title}</h3>
                      <p className="text-sm text-text-muted">{rec.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-4 sm:p-6">
              <p className="text-xs sm:text-sm font-medium text-text-muted mb-1">Current Week</p>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-text">{currentWeek > 0 ? currentWeek : "--"}</span>
                <span className="text-xs sm:text-sm text-text-muted">weeks</span>
              </div>
              <p className="text-xs text-text-muted mt-1 hidden sm:block">
                {trimester > 0 ? `Trimester ${trimester}` : "Gestational Age"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-4 sm:p-6">
              <p className="text-xs sm:text-sm font-medium text-text-muted mb-1">Days to D-Day</p>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-text">{daysToDue > 0 ? daysToDue : "--"}</span>
                <span className="text-xs sm:text-sm text-text-muted">days</span>
              </div>
              <p className="text-xs text-text-muted mt-1 hidden sm:block">
                {profile?.due_date ? new Date(profile.due_date).toLocaleDateString() : "Set your due date"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-4 sm:p-6">
              <p className="text-xs sm:text-sm font-medium text-text-muted mb-1">Training Sessions</p>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-text">{arStats.totalSessions}</span>
                <span className="text-xs sm:text-sm text-text-muted">total</span>
              </div>
              <p className="text-xs text-text-muted mt-1 hidden sm:block">{arStats.totalReps} reps completed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-4 sm:p-6">
              <p className="text-xs sm:text-sm font-medium text-text-muted mb-1">Scans Uploaded</p>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-text">{scans.length}</span>
                <span className="text-xs sm:text-sm text-text-muted">files</span>
              </div>
              <p className="text-xs text-text-muted mt-1 hidden sm:block">
                {scans.length === 0 ? (
                  <Link href="/dashboard/scans" className="text-brand-mid hover:underline">Upload your first scan</Link>
                ) : "Medical images stored"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent AR Training Sessions */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardHeader className="border-b-0 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-text">Recent Training Sessions</h3>
                  <p className="text-xs sm:text-sm text-text-muted">Your AR training history</p>
                </div>
                <Link href="/dashboard/ar-trainer" className="text-xs sm:text-sm text-brand-mid hover:text-brand-dark font-medium">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {arStats.recentSessions && arStats.recentSessions.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {arStats.recentSessions.slice(0, 4).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-brand-surface/30 rounded-xl"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-mid/10 text-brand-mid flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-text capitalize text-sm sm:text-base truncate">{session.session_type.replace('_', ' ')}</p>
                          <p className="text-xs sm:text-sm text-text-muted">
                            {new Date(session.started_at).toLocaleDateString()} • {Math.floor((session.duration_seconds || 0) / 60)}m
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-xs sm:text-sm font-medium text-text">{session.total_reps} reps</p>
                        <p className={`text-xs sm:text-sm ${
                          (session.avg_form_score || 0) >= 80 ? 'text-green-500' :
                          (session.avg_form_score || 0) >= 60 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {Math.round(session.avg_form_score || 0)}% form
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-text-muted mb-4 text-sm sm:text-base">No training sessions yet</p>
                  <Link href="/dashboard/ar-trainer">
                    <button className="px-4 py-2 bg-brand-mid text-white rounded-lg font-medium hover:bg-brand-dark transition-colors text-sm sm:text-base">
                      Start Training
                    </button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardHeader className="border-b-0 px-4 sm:px-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-text">Quick Actions</h3>
                <p className="text-xs sm:text-sm text-text-muted">Access key features</p>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                <Link href="/dashboard/ar-trainer">
                  <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4 p-3 sm:p-4 bg-brand-surface/50 rounded-xl hover:bg-brand-surface transition-colors cursor-pointer">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-mid text-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-xs sm:text-sm font-semibold text-text">AR Training</p>
                      <p className="text-xs text-text-muted hidden sm:block">Start a session</p>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/symptoms">
                  <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4 p-3 sm:p-4 bg-info/5 rounded-xl hover:bg-info/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-info text-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-xs sm:text-sm font-semibold text-text">Log Symptoms</p>
                      <p className="text-xs text-text-muted hidden sm:block">Track how you feel</p>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/scans">
                  <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4 p-3 sm:p-4 bg-success/5 rounded-xl hover:bg-success/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success text-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-xs sm:text-sm font-semibold text-text">Upload Scan</p>
                      <p className="text-xs text-text-muted hidden sm:block">Add medical images</p>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/reports">
                  <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4 p-3 sm:p-4 bg-warning/5 rounded-xl hover:bg-warning/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-warning text-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-xs sm:text-sm font-semibold text-text">Generate Report</p>
                      <p className="text-xs text-text-muted hidden sm:block">Download your data</p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Symptoms */}
        <Card className="mt-4 sm:mt-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
          <CardHeader className="border-b-0 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-text">Recent Symptoms</h3>
                <p className="text-xs sm:text-sm text-text-muted">Latest symptoms you've logged</p>
              </div>
              <Link href="/dashboard/symptoms" className="text-xs sm:text-sm text-brand-mid hover:text-brand-dark font-medium">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {recentSymptoms.length > 0 ? (
              <>
                {/* Mobile view - card style */}
                <div className="sm:hidden space-y-3">
                  {recentSymptoms.map((symptom) => (
                    <div key={symptom.id} className="p-3 bg-brand-surface/30 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-text capitalize text-sm">{symptom.name}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          symptom.severity === 'severe' ? 'bg-red-100 text-red-700' :
                          symptom.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {symptom.severity}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted">{new Date(symptom.logged_at).toLocaleDateString()}</p>
                      {symptom.notes && (
                        <p className="text-xs text-text-muted mt-1 line-clamp-2">{symptom.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
                {/* Desktop view - table style */}
                <div className="hidden sm:block overflow-x-auto">
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
              </>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-text-muted mb-4 text-sm sm:text-base">No symptoms logged yet</p>
                <Link href="/dashboard/symptoms">
                  <button className="px-4 py-2 bg-brand-mid text-white rounded-lg font-medium hover:bg-brand-dark transition-colors text-sm sm:text-base">
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
