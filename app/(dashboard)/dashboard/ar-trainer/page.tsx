import Link from "next/link";
import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { getProfile } from "@/app/actions/profile";
import { getARStats } from "@/app/actions/ar-training";

const sessions = [
  {
    name: "Simple Movement Session",
    duration: "5 min",
    difficulty: "Easy",
    progress: 0,
    slug: "simple-movement",
    available: true,
    description: "Gentle guided movements with face tracking - no full body detection needed"
  },
  {
    name: "Deep Squat Training",
    duration: "15 min",
    difficulty: "Beginner",
    progress: 0,
    slug: "deep-squat",
    available: true,
    description: "Full body pose tracking for proper squat form"
  },
  {
    name: "Pelvic Floor Exercises",
    duration: "20 min",
    difficulty: "Intermediate",
    progress: 0,
    slug: "pelvic-floor",
    available: false,
    description: "Targeted pelvic floor strengthening"
  },
  {
    name: "Birth Ball Movements",
    duration: "25 min",
    difficulty: "Beginner",
    progress: 0,
    slug: "birth-ball",
    available: false,
    description: "Exercises using a birth ball for comfort and preparation"
  },
  {
    name: "Hip Opening Stretches",
    duration: "20 min",
    difficulty: "Intermediate",
    progress: 0,
    slug: "hip-opening",
    available: false,
    description: "Stretches to improve hip mobility for labour"
  },
];

export default async function ARTrainerPage() {
  const profile = await getProfile();
  const stats = await getARStats();

  return (
    <>
      <Header title="AR Trainer" profile={profile} />

      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-text">AR Training Sessions</h1>
          <p className="text-sm sm:text-base text-text-muted">Interactive augmented reality exercises for pregnancy preparation</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:gap-4 text-center sm:text-left">
                <div className="p-2 sm:p-3 rounded-xl bg-brand-surface text-brand-mid mb-2 sm:mb-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-text">{stats.totalSessions}</p>
                  <p className="text-xs sm:text-sm text-text-muted">Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:gap-4 text-center sm:text-left">
                <div className="p-2 sm:p-3 rounded-xl bg-success/10 text-success mb-2 sm:mb-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-text">{stats.totalReps}</p>
                  <p className="text-xs sm:text-sm text-text-muted">Reps</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:gap-4 text-center sm:text-left">
                <div className="p-2 sm:p-3 rounded-xl bg-warning/10 text-warning mb-2 sm:mb-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-text">{stats.avgFormScore || 0}</p>
                  <p className="text-xs sm:text-sm text-text-muted">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions History */}
        {stats.recentSessions && stats.recentSessions.length > 0 && (
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardHeader className="border-b-0 px-4 sm:px-6">
              <h3 className="text-base sm:text-lg font-semibold text-text">Recent Sessions</h3>
              <p className="text-xs sm:text-sm text-text-muted">Your training history</p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2 sm:space-y-3">
                {stats.recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 sm:p-4 bg-brand-surface/30 rounded-xl"
                  >
                    {/* Mobile Layout */}
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text capitalize text-sm sm:text-base truncate">{session.session_type.replace('_', ' ')}</p>
                        <p className="text-xs sm:text-sm text-text-muted">
                          {new Date(session.started_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30 sm:hidden">
                      <div className="text-center">
                        <p className="text-lg font-bold text-text">{session.total_reps}</p>
                        <p className="text-xs text-text-muted">Reps</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${
                          (session.avg_form_score || 0) >= 80 ? 'text-green-500' :
                          (session.avg_form_score || 0) >= 60 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {Math.round(session.avg_form_score || 0)}
                        </p>
                        <p className="text-xs text-text-muted">Score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-text">
                          {Math.floor((session.duration_seconds || 0) / 60)}m
                        </p>
                        <p className="text-xs text-text-muted">Duration</p>
                      </div>
                    </div>
                    {/* Desktop Stats */}
                    <div className="hidden sm:flex items-center gap-6 mt-0 justify-end">
                      <div className="text-right">
                        <p className="text-sm text-text-muted">Reps</p>
                        <p className="text-xl font-bold text-text">{session.total_reps}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-muted">Form Score</p>
                        <p className={`text-xl font-bold ${
                          (session.avg_form_score || 0) >= 80 ? 'text-green-500' :
                          (session.avg_form_score || 0) >= 60 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {Math.round(session.avg_form_score || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-muted">Duration</p>
                        <p className="text-xl font-bold text-text">
                          {Math.floor((session.duration_seconds || 0) / 60)}m
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
          <CardHeader className="border-b-0 px-4 sm:px-6">
            <h3 className="text-base sm:text-lg font-semibold text-text">Available Sessions</h3>
            <p className="text-xs sm:text-sm text-text-muted">Start a new training session or continue where you left off</p>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {sessions.map((session) => (
                <div key={session.name} className="p-3 sm:p-4 bg-brand-surface/50 rounded-xl hover:bg-brand-surface transition-colors">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-mid text-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text text-sm sm:text-base">{session.name}</p>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-text-muted">
                        <span>{session.duration}</span>
                        <span className="w-1 h-1 rounded-full bg-text-muted"></span>
                        <span>{session.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                    <div className="flex-1 max-w-[120px] sm:max-w-[150px]">
                      <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                        <span className="text-text-muted">Progress</span>
                        <span className="font-medium text-text">{session.progress}%</span>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-brand-light rounded-full overflow-hidden">
                        <div className="h-full bg-brand-mid rounded-full" style={{ width: `${session.progress}%` }} />
                      </div>
                    </div>
                    {session.available ? (
                      <Link href={`/dashboard/ar-trainer/session/${session.slug}`}>
                        <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-mid text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-brand-dark transition-colors">
                          {session.progress > 0 ? "Continue" : "Start"}
                        </button>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-300 text-gray-500 rounded-lg text-xs sm:text-sm font-medium cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
