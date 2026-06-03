import Link from "next/link";
import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { getProfile } from "@/app/actions/profile";
import { getProgressSummary } from "@/app/actions/progress";

export default async function ProgressPage() {
  const [profile, progress] = await Promise.all([getProfile(), getProgressSummary()]);
  const unlockedCount = progress.achievements.filter((a) => a.unlocked).length;

  return (
    <>
      <Header title="My Progress" profile={profile} />

      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-text">My Progress</h1>
          <p className="text-sm sm:text-base text-text-muted">
            Your MatriVerse journey — pregnancy milestones and app activity
          </p>
        </div>

        {/* Pregnancy progress */}
        <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-brand-mid to-brand-dark border-0 shadow-xl">
          <CardContent className="p-5 sm:p-8">
            {progress.hasDueDate && progress.currentWeek ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 text-white">
                <div>
                  <p className="text-xs sm:text-sm opacity-80 mb-1">Pregnancy progress</p>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-2">Week {progress.currentWeek}</h2>
                  <p className="opacity-80 text-sm sm:text-base">
                    {progress.trimester === 1 && "First trimester"}
                    {progress.trimester === 2 && "Second trimester"}
                    {progress.trimester === 3 && "Third trimester"}
                    {progress.daysToDue != null &&
                      ` · ${progress.daysToDue} days until due date`}
                  </p>
                </div>
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-8 border-white/30 flex items-center justify-center shrink-0">
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold">{progress.pregnancyPercent}%</p>
                    <p className="text-xs opacity-80">of 40 weeks</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-white">
                <p className="text-xs sm:text-sm opacity-80 mb-1">Pregnancy progress</p>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Add your due date</h2>
                <p className="opacity-80 mb-4 text-sm sm:text-base">
                  Set your due date in your profile to see week-by-week milestones.
                </p>
                <Link
                  href="/dashboard/profile"
                  className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Update profile
                </Link>
              </div>
            )}
            <div className="mt-4 sm:mt-6">
              <div className="h-2 sm:h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${progress.pregnancyPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs sm:text-sm text-white opacity-80">
                <span>Week 1</span>
                <span>Week 40</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-brand-mid mb-1">
                {progress.stats.trainingSessions}
              </p>
              <p className="font-medium text-text text-sm sm:text-base">AR Training Sessions</p>
              <p className="text-xs sm:text-sm text-text-muted">
                {progress.stats.totalReps} reps ·{" "}
                {progress.stats.avgFormScore > 0
                  ? `${progress.stats.avgFormScore}% avg form`
                  : "No scores yet"}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-brand-mid mb-1">
                {progress.stats.breathingMinutes}
              </p>
              <p className="font-medium text-text text-sm sm:text-base">Breathing Minutes</p>
              <p className="text-xs sm:text-sm text-text-muted">
                {progress.stats.breathingSessions} sessions completed
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-brand-mid mb-1">
                {progress.stats.moodCheckIns}
              </p>
              <p className="font-medium text-text text-sm sm:text-base">Mood Check-ins</p>
              <p className="text-xs sm:text-sm text-text-muted">
                {progress.stats.moodStreak > 0
                  ? `${progress.stats.moodStreak} day streak`
                  : "Start logging today"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Timeline */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardHeader className="border-b-0 px-4 sm:px-6">
              <h3 className="text-base sm:text-lg font-semibold text-text">Pregnancy Timeline</h3>
              <p className="text-xs sm:text-sm text-text-muted">Key milestones on your journey</p>
            </CardHeader>
            <CardContent>
              {!progress.hasDueDate ? (
                <p className="text-sm text-text-muted py-4">
                  Add a due date in your profile to personalize this timeline.
                </p>
              ) : (
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-brand-light" />
                  <div className="space-y-6">
                    {progress.milestones.map((milestone) => (
                      <div key={milestone.week} className="relative flex gap-4 pl-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center z-10 ${
                            milestone.current
                              ? "bg-brand-mid ring-4 ring-brand-light"
                              : milestone.completed
                                ? "bg-success"
                                : "bg-brand-surface border-2 border-border"
                          }`}
                        >
                          {milestone.completed && !milestone.current && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                          {milestone.current && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div
                          className={`flex-1 pb-4 ${milestone.completed || milestone.current ? "" : "opacity-60"}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-brand-mid">
                              Week {milestone.week}
                            </span>
                            {milestone.current && (
                              <span className="px-2 py-0.5 bg-brand-mid text-white text-xs rounded-full">
                                You are here
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-text">{milestone.title}</p>
                          <p className="text-sm text-text-muted">{milestone.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardHeader className="border-b-0 px-4 sm:px-6">
              <h3 className="text-base sm:text-lg font-semibold text-text">Achievements</h3>
              <p className="text-xs sm:text-sm text-text-muted">
                {unlockedCount} of {progress.achievements.length} unlocked
              </p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {progress.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-3 sm:p-4 rounded-xl text-center transition-opacity ${
                      achievement.unlocked
                        ? "bg-brand-surface/50"
                        : "bg-brand-surface/30 opacity-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center ${
                        achievement.unlocked
                          ? "bg-gradient-to-br from-warning to-warning/70"
                          : "bg-border"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 sm:w-7 sm:h-7 ${achievement.unlocked ? "text-white" : "text-text-muted"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <p className="font-medium text-text text-xs sm:text-sm">{achievement.name}</p>
                    <p className="text-xs text-text-muted mt-0.5 hidden sm:block">{achievement.description}</p>
                    {achievement.dateLabel && (
                      <p className="text-xs text-brand-mid font-medium mt-1">
                        {achievement.dateLabel}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {unlockedCount === 0 && (
                <div className="mt-6 p-4 rounded-xl border border-dashed border-border text-center">
                  <p className="text-sm text-text-muted">
                    Try AR training, breathing, or mood logging to earn your first badge.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    <Link
                      href="/dashboard/ar-trainer"
                      className="text-xs text-brand-mid font-medium hover:underline"
                    >
                      AR Trainer
                    </Link>
                    <Link
                      href="/dashboard/breathing"
                      className="text-xs text-brand-mid font-medium hover:underline"
                    >
                      Breathing
                    </Link>
                    <Link
                      href="/dashboard/mood"
                      className="text-xs text-brand-mid font-medium hover:underline"
                    >
                      Mood
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
