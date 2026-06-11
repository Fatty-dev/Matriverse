"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui";
import type { Video, VideoCategory, UserVideoProgress } from "@/types";

interface VideoLibraryProps {
  videos: Video[];
  progressMap: Map<string, UserVideoProgress>;
}

const CATEGORIES: { key: VideoCategory | "all"; label: string }[] = [
  { key: "all", label: "All Videos" },
  { key: "education", label: "Education" },
  { key: "exercise", label: "Exercise" },
  { key: "breathing", label: "Breathing" },
  { key: "labor_prep", label: "Labor Prep" },
  { key: "nutrition", label: "Nutrition" },
  { key: "postpartum", label: "Postpartum" },
];

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function getCategoryColor(category: VideoCategory): string {
  switch (category) {
    case "education":
      return "bg-blue-100 text-blue-700";
    case "exercise":
      return "bg-green-100 text-green-700";
    case "breathing":
      return "bg-purple-100 text-purple-700";
    case "labor_prep":
      return "bg-red-100 text-red-700";
    case "nutrition":
      return "bg-orange-100 text-orange-700";
    case "postpartum":
      return "bg-pink-100 text-pink-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function VideoLibrary({ videos, progressMap }: VideoLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | "all">("all");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const filteredVideos =
    selectedCategory === "all"
      ? videos
      : videos.filter((v) => v.category === selectedCategory);

  const featuredVideos = videos.filter((v) => v.is_featured);

  return (
    <>
      {/* Featured Section */}
      {featuredVideos.length > 0 && selectedCategory === "all" && (
        <Card className="mb-6 bg-gradient-to-r from-brand-mid to-brand-accent border-0 shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Featured Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredVideos.slice(0, 3).map((video) => {
                const thumbnail = video.video_url ? getYouTubeThumbnail(video.video_url) : null;
                return (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="bg-white/10 rounded-xl overflow-hidden cursor-pointer hover:bg-white/20 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video">
                      {thumbnail ? (
                        <img src={thumbnail} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/10" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      {video.duration_seconds && (
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white rounded text-xs">
                          {formatDuration(video.duration_seconds)}
                        </div>
                      )}
                    </div>
                    {/* Title */}
                    <div className="p-3">
                      <h3 className="font-semibold text-white text-sm truncate">{video.title}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.key
                ? "bg-brand-mid text-white"
                : "bg-white text-text-muted hover:bg-brand-surface"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Videos Grid */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="border-b-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text">
                {selectedCategory === "all" ? "All Videos" : CATEGORIES.find(c => c.key === selectedCategory)?.label}
              </h3>
              <p className="text-sm text-text-muted">{filteredVideos.length} videos</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-brand-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-brand-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">No videos in this category</h3>
              <p className="text-text-muted">Check back soon for more content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => {
                const progress = progressMap.get(video.id);
                const isCompleted = progress?.completed;
                const watchProgress = progress && video.duration_seconds
                  ? Math.round((progress.progress_seconds / video.duration_seconds) * 100)
                  : 0;

                return (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="group bg-brand-surface/30 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gray-200 overflow-hidden">
                      {video.video_url && getYouTubeThumbnail(video.video_url) ? (
                        <img
                          src={getYouTubeThumbnail(video.video_url)!}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-mid/20 to-brand-accent/20" />
                      )}
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-mid transition-all shadow-lg">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>

                      {/* Category badge */}
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(video.category)}`}>
                        {video.category.replace("_", " ")}
                      </div>

                      {/* Completed badge */}
                      {isCompleted && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Completed
                        </div>
                      )}

                      {/* Duration */}
                      {video.duration_seconds && (
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white rounded text-xs">
                          {formatDuration(video.duration_seconds)}
                        </div>
                      )}

                      {/* Progress bar */}
                      {watchProgress > 0 && !isCompleted && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                          <div
                            className="h-full bg-brand-mid"
                            style={{ width: `${watchProgress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h4 className="font-semibold text-text mb-1 line-clamp-1">{video.title}</h4>
                      {video.description && (
                        <p className="text-sm text-text-muted line-clamp-2 mb-2">{video.description}</p>
                      )}
                      {video.trimester && (
                        <span className="text-xs text-text-muted">
                          Trimester {video.trimester}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </>
  );
}

function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getYouTubeThumbnail(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return null;
}

function VideoModal({ video, onClose }: { video: Video; onClose: () => void }) {
  const youtubeId = video.video_url ? getYouTubeVideoId(video.video_url) : null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-base font-bold text-text truncate">{video.title}</h2>
            <p className="text-xs text-text-muted capitalize">{video.category.replace("_", " ")}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Player */}
        <div className="aspect-video bg-gray-900 flex-shrink-0">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-base font-medium mb-1">Video Coming Soon</p>
                <p className="text-white/70 text-sm">This is a placeholder</p>
              </div>
            </div>
          )}
        </div>

        {/* Description - Scrollable */}
        <div className="p-4 overflow-y-auto flex-1">
          <p className="text-sm text-text-muted mb-3">{video.description || "No description available."}</p>

          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {video.tags.slice(0, 5).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-brand-surface text-brand-mid text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-brand-mid text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
