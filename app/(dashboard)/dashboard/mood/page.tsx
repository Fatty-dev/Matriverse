import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { getProfile } from "@/app/actions/profile";

const moodHistory = [
  { date: "Today", mood: "Happy", score: 9, note: "Felt the baby kick today!" },
  { date: "Yesterday", mood: "Calm", score: 7, note: "Good rest, peaceful day" },
  { date: "Apr 22", mood: "Anxious", score: 5, note: "Worried about upcoming appointment" },
  { date: "Apr 21", mood: "Happy", score: 8, note: "Partner was very supportive" },
  { date: "Apr 20", mood: "Tired", score: 6, note: "Didn't sleep well" },
];

const moodOptions = [
  { emoji: "😊", label: "Happy", color: "success" },
  { emoji: "😌", label: "Calm", color: "info" },
  { emoji: "😐", label: "Neutral", color: "warning" },
  { emoji: "😟", label: "Anxious", color: "danger" },
  { emoji: "😢", label: "Sad", color: "danger" },
  { emoji: "😴", label: "Tired", color: "warning" },
];

export default async function MoodPage() {
  const profile = await getProfile();

  return (
    <>
      <Header title="Mood Tracker" profile={profile} />

      <main className="flex-1 px-8 sm:px-10 lg:px-12 py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Mood Tracker</h1>
          <p className="text-text-muted">Track your emotional well-being throughout pregnancy</p>
        </div>

        {/* Today's Check-in */}
        <Card className="mb-8 bg-gradient-to-r from-brand-mid to-brand-dark border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center text-white">
              <p className="text-sm opacity-80 mb-2">How are you feeling today?</p>
              <h2 className="text-2xl font-bold mb-6">Daily Mood Check-in</h2>
              <div className="flex justify-center gap-4 flex-wrap">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.label}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <span className="text-4xl">{mood.emoji}</span>
                    <span className="text-sm font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-5">
              <p className="text-sm text-text-muted mb-1">Weekly Average</p>
              <p className="text-3xl font-bold text-text">7.2</p>
              <p className="text-xs text-success">+0.5 from last week</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-5">
              <p className="text-sm text-text-muted mb-1">Most Common</p>
              <p className="text-2xl font-bold text-text">Happy 😊</p>
              <p className="text-xs text-text-muted">5 times this week</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-5">
              <p className="text-sm text-text-muted mb-1">Check-in Streak</p>
              <p className="text-3xl font-bold text-text">12 days</p>
              <p className="text-xs text-text-muted">Keep it up!</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardContent className="p-5">
              <p className="text-sm text-text-muted mb-1">Total Entries</p>
              <p className="text-3xl font-bold text-text">45</p>
              <p className="text-xs text-text-muted">Since week 20</p>
            </CardContent>
          </Card>
        </div>

        {/* Mood Chart Placeholder */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
          <CardHeader className="border-b-0">
            <h3 className="text-lg font-semibold text-text">Mood Trends</h3>
            <p className="text-sm text-text-muted">Your mood over the past 7 days</p>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-4 px-4">
              {[7, 8, 5, 9, 6, 7, 8].map((score, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-brand-mid to-brand-accent rounded-t-lg transition-all"
                    style={{ height: `${score * 10}%` }}
                  />
                  <span className="text-xs text-text-muted">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mood History */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
          <CardHeader className="border-b-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text">Recent Entries</h3>
                <p className="text-sm text-text-muted">Your mood journal</p>
              </div>
              <button className="text-sm text-brand-mid hover:text-brand-dark font-medium">View All</button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moodHistory.map((entry, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-brand-surface/50">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm">
                    {entry.mood === "Happy" && "😊"}
                    {entry.mood === "Calm" && "😌"}
                    {entry.mood === "Anxious" && "😟"}
                    {entry.mood === "Tired" && "😴"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-text">{entry.mood}</span>
                      <span className="text-sm text-text-muted">{entry.date}</span>
                    </div>
                    <p className="text-sm text-text-muted mb-2">{entry.note}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-text-muted">Score:</span>
                      <span className={`text-sm font-medium ${
                        entry.score >= 7 ? "text-success" : entry.score >= 5 ? "text-warning" : "text-danger"
                      }`}>{entry.score}/10</span>
                    </div>
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
