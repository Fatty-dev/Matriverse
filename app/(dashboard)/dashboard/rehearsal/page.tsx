import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { getProfile } from "@/app/actions/profile";

const stages = [
  { name: "Early Labor", description: "Understanding contractions and timing", duration: "30 min", status: "completed" },
  { name: "Active Labor", description: "Breathing techniques and positions", duration: "45 min", status: "in_progress" },
  { name: "Transition Phase", description: "Managing intense contractions", duration: "30 min", status: "locked" },
  { name: "Pushing Stage", description: "Effective pushing techniques", duration: "40 min", status: "locked" },
  { name: "Delivery", description: "Final moments and first contact", duration: "20 min", status: "locked" },
];

export default async function RehearsalPage() {
  const profile = await getProfile();

  return (
    <>
      <Header title="Labour Rehearsal" profile={profile} />

      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-text">Labour Rehearsal</h1>
          <p className="text-sm sm:text-base text-text-muted">Practice and prepare for each stage of labor</p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-text">Your Progress</h3>
                <p className="text-xs sm:text-sm text-text-muted">1 of 5 stages completed</p>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-brand-mid">20%</span>
            </div>
            <div className="h-2 sm:h-3 bg-brand-light rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-mid to-brand-accent rounded-full" style={{ width: "20%" }} />
            </div>
          </CardContent>
        </Card>

        {/* Stages */}
        <div className="space-y-3 sm:space-y-4">
          {stages.map((stage, index) => (
            <Card key={stage.name} className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5 ${stage.status === "locked" ? "opacity-60" : ""}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start sm:items-center gap-3 sm:gap-6">
                  {/* Stage Number */}
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0 ${
                    stage.status === "completed" ? "bg-success text-white" :
                    stage.status === "in_progress" ? "bg-brand-mid text-white" :
                    "bg-brand-surface text-text-muted"
                  }`}>
                    {stage.status === "completed" ? (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Stage Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                      <h3 className="text-base sm:text-lg font-semibold text-text">{stage.name}</h3>
                      {stage.status === "in_progress" && (
                        <span className="px-2 py-0.5 bg-brand-surface text-brand-mid text-xs font-medium rounded-full">
                          In Progress
                        </span>
                      )}
                      {stage.status === "locked" && (
                        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-text-muted mb-1 sm:mb-2">{stage.description}</p>
                    <p className="text-xs text-text-muted">Duration: {stage.duration}</p>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {stage.status === "completed" && (
                      <button className="px-3 sm:px-4 py-1.5 sm:py-2 border border-success text-success rounded-lg text-xs sm:text-sm font-medium hover:bg-success hover:text-white transition-colors">
                        Review
                      </button>
                    )}
                    {stage.status === "in_progress" && (
                      <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-mid text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-brand-dark transition-colors">
                        Continue
                      </button>
                    )}
                    {stage.status === "locked" && (
                      <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-brand-surface text-text-muted rounded-lg text-xs sm:text-sm font-medium cursor-not-allowed">
                        Locked
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips Card */}
        <Card className="mt-6 sm:mt-8 bg-gradient-to-r from-info/10 to-info/5 border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 bg-info/20 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-text mb-1 text-sm sm:text-base">Pro Tip</h4>
                <p className="text-xs sm:text-sm text-text-muted">Practice each stage multiple times. Familiarity with the process can help reduce anxiety during actual labor.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
