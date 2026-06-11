import { Header } from "@/components/layout";
import { getProfile } from "@/app/actions/profile";
import { getLabourRehearsalProgress } from "@/app/actions/labour-rehearsal";
import { LabourRehearsalClient } from "./LabourRehearsalClient";

export default async function RehearsalPage() {
  const profile = await getProfile();
  const progressResult = await getLabourRehearsalProgress();
  const progressData = progressResult.success ? progressResult.data || [] : [];

  return (
    <>
      <Header title="Labour Rehearsal" profile={profile} />
      <LabourRehearsalClient initialProgress={progressData} />
    </>
  );
}
