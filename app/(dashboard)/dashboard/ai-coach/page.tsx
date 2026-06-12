"use client";

import { AICoachChat } from "@/components/chat/AICoachChat";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useState, useEffect } from "react";
import { getConversations, deleteConversation, type Conversation } from "@/app/actions/chat";
import { getProfile } from "@/app/actions/profile";

export default function AICoachPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("there");
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    loadConversations();
  }, []);

  const loadProfile = async () => {
    const profile = await getProfile();
    setFirstName(profile?.first_name || "there");

    // Calculate current week from due date
    if (profile?.due_date) {
      const dueDate = new Date(profile.due_date);
      const now = new Date();
      const diffMs = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const weeksRemaining = Math.ceil(diffDays / 7);
      const week = 40 - weeksRemaining;
      if (week > 0 && week <= 42) {
        setCurrentWeek(week);
      }
    }
  };

  const loadConversations = async () => {
    setIsLoading(true);
    const result = await getConversations();
    if (result.success && result.conversations) {
      setConversations(result.conversations);
    }
    setIsLoading(false);
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const handleDeleteConversation = async (id: string) => {
    const result = await deleteConversation(id);
    if (result.success) {
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
      }
    }
  };

  const handleConversationCreated = (id: string) => {
    setCurrentConversationId(id);
    loadConversations();
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat Header */}
        <div className="flex-shrink-0 border-b border-border bg-white">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-brand-surface rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-mid flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-text truncate">AI Pregnancy Coach</h1>
                <p className="text-xs text-text-muted hidden sm:block">Your 24/7 companion for pregnancy guidance</p>
              </div>
            </div>
          </div>

          {/* Disclaimer Banner */}
          <div className="px-4 sm:px-6 pb-3">
            <div className="flex items-start gap-2 p-2 sm:p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <svg className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-text-muted">
                General guidance only. Consult your healthcare provider for medical advice.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-hidden">
          <AICoachChat
            firstName={firstName}
            currentWeek={currentWeek}
            currentConversationId={currentConversationId}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>
    </div>
  );
}
