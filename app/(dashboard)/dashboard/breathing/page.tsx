"use client";

import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui";
import { BreathingExerciseComponent } from "@/components/breathing/BreathingExercise";
import { breathingExercises, type BreathingExercise } from "@/constants/breathingExercises";
import {
  getBreathingStats,
  getBreathingSessions,
  type BreathingSession,
} from "@/app/actions/breathing";
import { getProfile } from "@/app/actions/profile";
import { useState, useEffect } from "react";
import type { Profile } from "@/types";

export default function BreathingPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    favoriteExercise: null as string | null,
  });
  const [sessions, setSessions] = useState<BreathingSession[]>([]);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [profileData, statsData, sessionsData] = await Promise.all([
      getProfile(),
      getBreathingStats(),
      getBreathingSessions(),
    ]);

    setProfile(profileData);
    setStats(statsData);
    setSessions(sessionsData);

    // Mark exercises as completed if user has done them at least once
    const completed = new Set(sessionsData.map((s) => s.exercise_name));
    setCompletedExercises(completed);
  };

  const handleExerciseComplete = () => {
    setSelectedExercise(null);
    loadData(); // Refresh stats and sessions
  };

  const handleExerciseCancel = () => {
    setSelectedExercise(null);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Featured exercise - rotate or pick one
  const featuredExercise = breathingExercises[0];

  return (
    <>
      <Header title="Breathing Coach" profile={profile} />

      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-brand-surface/30">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-text">Breathing Exercises</h1>
          <p className="text-sm sm:text-base text-text-muted">Master breathing techniques for labor and relaxation</p>
        </div>

        {/* Current Session Card */}
        <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-brand-mid to-brand-dark border-0 shadow-xl">
          <CardContent className="p-5 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-xs sm:text-sm opacity-80 mb-2">Today&apos;s Featured Exercise</p>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">{featuredExercise.name}</h2>
                <p className="opacity-80 mb-4 text-sm sm:text-base">{featuredExercise.description}</p>
                <button
                  onClick={() => setSelectedExercise(featuredExercise)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-brand-mid rounded-lg font-medium hover:bg-brand-light transition-colors text-sm sm:text-base"
                >
                  Start Session
                </button>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 rounded-full border-4 border-white/30 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-white/50 flex items-center justify-center animate-pulse">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[
            { label: "Sessions Completed", value: stats.totalSessions.toString(), icon: "check" },
            { label: "Total Minutes", value: stats.totalMinutes.toString(), icon: "clock" },
            { label: "Current Streak", value: stats.currentStreak > 0 ? `${stats.currentStreak} days` : "0", icon: "fire" },
            { label: "Favorite Exercise", value: stats.favoriteExercise || "--", icon: "heart" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
              <CardContent className="p-4 sm:p-5">
                <p className="text-xs sm:text-sm text-text-muted mb-1">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-text truncate">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Exercise List */}
        <Card className="mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
          <CardHeader className="border-b-0 px-4 sm:px-6">
            <h3 className="text-base sm:text-lg font-semibold text-text">All Exercises</h3>
            <p className="text-xs sm:text-sm text-text-muted">Choose an exercise to practice</p>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-2 sm:space-y-3">
              {breathingExercises.map((exercise) => {
                const isCompleted = completedExercises.has(exercise.name);
                return (
                  <div
                    key={exercise.name}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-border/50 hover:border-brand-light hover:bg-brand-surface/30 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCompleted ? "bg-success/10 text-success" : "bg-brand-surface text-brand-mid"}`}>
                        {isCompleted ? (
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-text text-sm sm:text-base truncate">{exercise.name}</p>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-text-muted">
                          <span>{exercise.duration}</span>
                          <span className="px-2 py-0.5 bg-brand-surface rounded-full text-xs hidden sm:inline">{exercise.type}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedExercise(exercise)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 border border-brand-mid text-brand-mid rounded-lg text-xs sm:text-sm font-medium hover:bg-brand-mid hover:text-white transition-colors flex-shrink-0"
                    >
                      {isCompleted ? "Repeat" : "Start"}
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Session History */}
        {sessions.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg shadow-brand-dark/5">
            <CardHeader className="border-b-0 px-4 sm:px-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-text">Recent Sessions</h3>
                <p className="text-xs sm:text-sm text-text-muted">Your breathing practice history</p>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2 sm:space-y-3">
                {sessions.slice(0, 10).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-brand-surface/30"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-text text-sm sm:text-base truncate">{session.exercise_name}</p>
                        <p className="text-xs sm:text-sm text-text-muted">
                          {formatDate(session.completed_at)} <span className="hidden sm:inline">at {formatTime(session.completed_at)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs sm:text-sm font-medium text-text">{formatDuration(session.duration_seconds)}</p>
                      <p className="text-xs text-text-muted capitalize hidden sm:block">{session.exercise_type.replace("_", " ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Exercise Modal */}
      {selectedExercise && (
        <BreathingExerciseComponent
          exercise={selectedExercise}
          onComplete={handleExerciseComplete}
          onCancel={handleExerciseCancel}
        />
      )}
    </>
  );
}
