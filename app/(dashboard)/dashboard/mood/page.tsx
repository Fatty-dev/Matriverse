import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { getProfile } from "@/app/actions/profile";
import { getMoodEntries, getMoodStats, getTodaysMoodEntry } from "@/app/actions/mood";
import { MoodCheckIn } from "@/components/mood";

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊",
  calm: "😌",
  neutral: "😐",
  anxious: "😟",
  sad: "😢",
  tired: "😴",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function MoodPage() {
  const profile = await getProfile();
  const stats = await getMoodStats();
  const entriesResult = await getMoodEntries(10);
  const entries = entriesResult.success ? entriesResult.data || [] : [];
  const todayResult = await getTodaysMoodEntry();
  const todayEntry = todayResult.success ? todayResult.data : null;

  return (
    <>
      <Header title="Mood Tracker" profile={profile} />

      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-text">Mood Tracker</h1>
          <p className="text-sm sm:text-base text-text-muted">Track your emotional well-being throughout pregnancy</p>
        </div>

        {/* Today's Check-in */}
        {!todayEntry ? (
          <div className="mb-6 sm:mb-8">
            <MoodCheckIn />
          </div>
        ) : (
          <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-brand-mid to-brand-dark border-0 shadow-xl">
            <CardContent className="p-5 sm:p-8">
              <div className="text-center text-white">
                <p className="text-xs sm:text-sm opacity-80 mb-2">You already checked in today</p>
                <div className="text-4xl sm:text-5xl mb-2">{MOOD_EMOJIS[todayEntry.mood]}</div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 capitalize">{todayEntry.mood}</h2>
                <p className="opacity-80 text-sm sm:text-base">Score: {todayEntry.score}/10</p>
                {todayEntry.note && (
                  <p className="mt-3 text-xs sm:text-sm opacity-70 italic">&quot;{todayEntry.note}&quot;</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs sm:text-sm text-text-muted mb-1">Weekly Average</p>
              <p className="text-2xl sm:text-3xl font-bold text-text">
                {stats.weeklyAverage > 0 ? stats.weeklyAverage.toFixed(1) : "N/A"}
              </p>
              <p className="text-xs text-text-muted hidden sm:block">Based on {stats.weeklyData.filter(d => d.score > 0).length} entries</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs sm:text-sm text-text-muted mb-1">Most Common</p>
              <p className="text-lg sm:text-2xl font-bold text-text capitalize truncate">
                {stats.mostCommonMood ? `${stats.mostCommonMood} ${MOOD_EMOJIS[stats.mostCommonMood]}` : "N/A"}
              </p>
              <p className="text-xs text-text-muted hidden sm:block">This week</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs sm:text-sm text-text-muted mb-1">Streak</p>
              <p className="text-2xl sm:text-3xl font-bold text-text">{stats.streak} <span className="text-sm sm:text-base font-normal">days</span></p>
              <p className="text-xs text-text-muted hidden sm:block">{stats.streak > 0 ? "Keep it up!" : "Start today!"}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs sm:text-sm text-text-muted mb-1">Total Entries</p>
              <p className="text-2xl sm:text-3xl font-bold text-text">{stats.totalEntries}</p>
              <p className="text-xs text-text-muted hidden sm:block">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Mood Chart */}
        <Card className="mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
          <CardHeader className="border-b-0 px-4 sm:px-6">
            <h3 className="text-base sm:text-lg font-semibold text-text">Mood Trends</h3>
            <p className="text-xs sm:text-sm text-text-muted">Your mood over the past 7 days</p>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="h-36 sm:h-48 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-4">
              {stats.weeklyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      data.score > 0
                        ? "bg-gradient-to-t from-brand-mid to-brand-accent"
                        : "bg-gray-200"
                    }`}
                    style={{ height: data.score > 0 ? `${data.score * 10}%` : "5%" }}
                  />
                  <span className="text-[10px] sm:text-xs text-text-muted">{data.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mood History */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
          <CardHeader className="border-b-0 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-text">Recent Entries</h3>
                <p className="text-xs sm:text-sm text-text-muted">Your mood journal</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {entries.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl sm:text-3xl">😊</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-text mb-2">No entries yet</h3>
                <p className="text-sm text-text-muted">Start tracking your mood to see your history here</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-brand-surface/50">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0">
                      {MOOD_EMOJIS[entry.mood]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-text capitalize text-sm sm:text-base">{entry.mood}</span>
                        <span className="text-xs sm:text-sm text-text-muted">{formatDate(entry.logged_at)}</span>
                      </div>
                      {entry.note && (
                        <p className="text-xs sm:text-sm text-text-muted mb-2 line-clamp-2">{entry.note}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-text-muted">Score:</span>
                        <span className={`text-xs sm:text-sm font-medium ${
                          entry.score >= 7 ? "text-success" : entry.score >= 5 ? "text-warning" : "text-danger"
                        }`}>{entry.score}/10</span>
                        {entry.context && entry.context !== "general" && (
                          <span className="text-xs px-2 py-0.5 bg-brand-surface rounded-full text-text-muted capitalize">
                            {entry.context.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
