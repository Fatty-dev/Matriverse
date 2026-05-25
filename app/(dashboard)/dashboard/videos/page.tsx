import { Header } from "@/components/layout";
import { getProfile } from "@/app/actions/profile";
import { getVideos, getVideoStats, getUserVideoProgress } from "@/app/actions/videos";
import { VideoLibrary } from "@/components/videos/VideoLibrary";

export default async function VideosPage() {
  const profile = await getProfile();
  const videosResult = await getVideos();
  const videos = videosResult.success ? videosResult.data || [] : [];
  const stats = await getVideoStats();
  const progressResult = await getUserVideoProgress();
  const progress = progressResult.success ? progressResult.data || [] : [];

  // Create a map of video progress
  const progressMap = new Map(progress.map(p => [p.video_id, p]));

  return (
    <>
      <Header title="Video Library" profile={profile} />

      <main className="flex-1 px-8 sm:px-10 lg:px-12 py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-brand-mid">{stats.totalVideos}</p>
            <p className="text-sm text-text-muted">Total Videos</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-brand-mid">{stats.watchedVideos}</p>
            <p className="text-sm text-text-muted">Started</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-brand-mid">{stats.completedVideos}</p>
            <p className="text-sm text-text-muted">Completed</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-brand-mid">
              {Math.floor(stats.totalWatchTime / 60)}m
            </p>
            <p className="text-sm text-text-muted">Watch Time</p>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">Video Library</h1>
          <p className="text-text-muted">
            Educational videos to help you prepare for your pregnancy journey and D-day
          </p>
        </div>

        <VideoLibrary videos={videos} progressMap={progressMap} />
      </main>
    </>
  );
}
