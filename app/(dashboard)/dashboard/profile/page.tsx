import { Header } from "@/components/layout";
import { Card, CardContent } from "@/components/ui";
import { getProfile } from "@/app/actions/profile";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Not set";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";
  return first + last || "U";
}

function getFullName(firstName?: string | null, lastName?: string | null): string {
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  return "User";
}

function getGestationalWeek(dueDate?: string | null): number | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const weeksRemaining = Math.ceil(diffDays / 7);
  const currentWeek = 40 - weeksRemaining;
  return currentWeek > 0 && currentWeek <= 42 ? currentWeek : null;
}

export default async function ProfilePage() {
  const profile = await getProfile();

  const initials = getInitials(profile?.first_name, profile?.last_name);
  const fullName = getFullName(profile?.first_name, profile?.last_name);
  const week = getGestationalWeek(profile?.due_date);
  const dueDate = formatDate(profile?.due_date);

  return (
    <>
      <Header title="Scan & Profile" profile={profile} />

      <main className="flex-1 px-8 sm:px-10 lg:px-12 py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">My Profile</h1>
          <p className="text-text-muted">Your pregnancy profile and health information</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
          <CardContent className="p-6 lg:p-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-brand-light/30">
              <div className="w-24 h-24 rounded-full bg-brand-light shrink-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-brand-dark">{initials}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-text">{fullName}</h2>
                <p className="text-text-muted">
                  {week ? `Week ${week} of Pregnancy` : "Pregnancy journey started"}
                </p>
              </div>
              <button className="px-6 py-2.5 border border-brand-mid text-brand-mid rounded-xl font-medium hover:bg-brand-mid hover:text-white transition-colors">
                Edit Profile
              </button>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl">
                <svg className="w-5 h-5 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-text-muted">Email</p>
                  <p className="text-sm font-medium text-text">{profile?.email || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl">
                <svg className="w-5 h-5 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-xs text-text-muted">Phone</p>
                  <p className="text-sm font-medium text-text">{profile?.phone || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl">
                <svg className="w-5 h-5 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-text-muted">Due Date</p>
                  <p className="text-sm font-medium text-text">{dueDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl">
                <svg className="w-5 h-5 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="text-xs text-text-muted">First Pregnancy</p>
                  <p className="text-sm font-medium text-text">
                    {profile?.is_first_pregnancy === true ? "Yes" : profile?.is_first_pregnancy === false ? "No" : "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl">
                <svg className="w-5 h-5 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                </svg>
                <div>
                  <p className="text-xs text-text-muted">Date of Birth</p>
                  <p className="text-sm font-medium text-text">{formatDate(profile?.date_of_birth)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
