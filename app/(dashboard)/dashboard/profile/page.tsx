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

      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-text">My Profile</h1>
          <p className="text-sm sm:text-base text-text-muted">Your pregnancy profile and health information</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-brand-light/30">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-light shrink-0 flex items-center justify-center mx-auto sm:mx-0">
                <span className="text-2xl sm:text-3xl font-bold text-brand-dark">{initials}</span>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-text">{fullName}</h2>
                <p className="text-sm sm:text-base text-text-muted">
                  {week ? `Week ${week} of Pregnancy` : "Pregnancy journey started"}
                </p>
              </div>
              <button className="px-4 sm:px-6 py-2 sm:py-2.5 border border-brand-mid text-brand-mid rounded-xl font-medium hover:bg-brand-mid hover:text-white transition-colors text-sm sm:text-base w-full sm:w-auto">
                Edit Profile
              </button>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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

              {profile?.partner_name && (
                <div className="flex items-center gap-3 p-4 bg-brand-surface rounded-xl">
                  <svg className="w-5 h-5 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-text-muted">Partner</p>
                    <p className="text-sm font-medium text-text">{profile.partner_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Contact Section */}
            {(profile?.emergency_contact_name || profile?.emergency_contact_phone) && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-brand-light/30">
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <p className="text-xs text-text-muted">Contact Name</p>
                      <p className="text-sm font-medium text-text">{profile?.emergency_contact_name || "Not set"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-xs text-text-muted">Contact Phone</p>
                      <p className="text-sm font-medium text-text">{profile?.emergency_contact_phone || "Not set"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-text-muted">Relationship</p>
                      <p className="text-sm font-medium text-text capitalize">{profile?.emergency_contact_relationship || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Medical History Section */}
            {profile?.medical_history && profile.medical_history.length > 0 && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-brand-light/30">
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Medical History
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.medical_history.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-brand-surface text-brand-mid text-sm rounded-full"
                    >
                      {typeof item === 'string' ? item : item.condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
