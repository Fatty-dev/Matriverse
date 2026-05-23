import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout";
import { getProfile } from "@/app/actions/profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  // If user has no profile or hasn't completed onboarding, redirect to step-2
  if (!profile) {
    redirect("/login");
  }

  if (!profile.onboarding_completed) {
    // Check what step they need to complete
    if (!profile.first_name || !profile.last_name || !profile.phone || !profile.date_of_birth) {
      redirect("/signup/step-2");
    } else {
      redirect("/signup/step-3");
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">{children}</div>
    </div>
  );
}
