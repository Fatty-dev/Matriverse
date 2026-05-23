import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { getProfile } from "@/app/actions/profile";

const milestones = [
  { week: 28, title: "Third Trimester Begins", description: "Baby weighs about 2.2 pounds", completed: true },
  { week: 30, title: "Brain Development", description: "Rapid brain growth begins", completed: true },
  { week: 32, title: "Current Week", description: "Baby practices breathing movements", completed: true, current: true },
  { week: 34, title: "Vernix Thickens", description: "Protective coating develops", completed: false },
  { week: 36, title: "Full Term Soon", description: "Baby may drop into position", completed: false },
  { week: 38, title: "Early Term", description: "Baby is considered early term", completed: false },
  { week: 40, title: "Due Date", description: "Full term pregnancy", completed: false },
];

const achievements = [
  { name: "First Training Complete", icon: "trophy", date: "Week 28" },
  { name: "7-Day Streak", icon: "fire", date: "Week 30" },
  { name: "Breathing Master", icon: "wind", date: "Week 31" },
  { name: "Mood Logger", icon: "heart", date: "Week 32" },
];

export default async function ProgressPage() {
  const profile = await getProfile();

  return (
    <>
      <Header title="My Progress" profile={profile} />

      <main className="flex-1 px-8 sm:px-10 lg:px-12 py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">My Progress</h1>
          <p className="text-text-muted">Track your pregnancy journey and achievements</p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8 bg-gradient-to-r from-brand-mid to-brand-dark border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-80 mb-1">Current Progress</p>
                <h2 className="text-4xl font-bold mb-2">Week 32</h2>
                <p className="opacity-80">8 weeks until due date</p>
              </div>
              <div className="text-right">
                <div className="w-32 h-32 rounded-full border-8 border-white/30 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold">80%</p>
                    <p className="text-xs opacity-80">Complete</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: "80%" }} />
              </div>
              <div className="flex justify-between mt-2 text-sm opacity-80">
                <span>Week 1</span>
                <span>Week 40</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats */}
          {[
            { label: "Training Sessions", value: "24", sublabel: "Completed" },
            { label: "Breathing Exercises", value: "45", sublabel: "Minutes total" },
            { label: "Mood Check-ins", value: "30", sublabel: "Days logged" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-brand-mid mb-1">{stat.value}</p>
                <p className="font-medium text-text">{stat.label}</p>
                <p className="text-sm text-text-muted">{stat.sublabel}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardHeader className="border-b-0">
              <h3 className="text-lg font-semibold text-text">Pregnancy Timeline</h3>
              <p className="text-sm text-text-muted">Key milestones in your journey</p>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-brand-light" />

                <div className="space-y-6">
                  {milestones.map((milestone) => (
                    <div key={milestone.week} className="relative flex gap-4 pl-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 ${
                        milestone.current ? "bg-brand-mid ring-4 ring-brand-light" :
                        milestone.completed ? "bg-success" : "bg-brand-surface border-2 border-border"
                      }`}>
                        {milestone.completed && !milestone.current && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {milestone.current && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div className={`flex-1 pb-4 ${milestone.completed ? "" : "opacity-60"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-brand-mid">Week {milestone.week}</span>
                          {milestone.current && (
                            <span className="px-2 py-0.5 bg-brand-mid text-white text-xs rounded-full">Current</span>
                          )}
                        </div>
                        <p className="font-medium text-text">{milestone.title}</p>
                        <p className="text-sm text-text-muted">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardHeader className="border-b-0">
              <h3 className="text-lg font-semibold text-text">Achievements</h3>
              <p className="text-sm text-text-muted">Badges you&apos;ve earned</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.name} className="p-4 rounded-xl bg-brand-surface/50 text-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-warning to-warning/70 mx-auto mb-3 flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <p className="font-medium text-text text-sm">{achievement.name}</p>
                    <p className="text-xs text-text-muted">{achievement.date}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl border border-dashed border-border text-center">
                <p className="text-sm text-text-muted">More achievements to unlock!</p>
                <p className="text-xs text-text-muted mt-1">Keep using MatriVerse to earn badges</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
