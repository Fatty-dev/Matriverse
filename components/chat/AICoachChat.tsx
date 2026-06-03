"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage, getConversationMessages } from "@/app/actions/chat";
import {
  getMatriverseWelcomeMessage,
  SUGGESTED_COACH_QUESTIONS,
} from "@/lib/ai-coach/constants";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface AICoachChatProps {
  firstName: string;
  currentConversationId: string | null;
  onConversationCreated?: (id: string) => void;
}

function welcomeMessage(firstName: string) {
  return {
    id: "welcome",
    role: "assistant" as const,
    content: getMatriverseWelcomeMessage(firstName),
  };
}

export function AICoachChat({ firstName, currentConversationId, onConversationCreated }: AICoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage(firstName)]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId);
    } else {
      // Reset to welcome message for new conversation
      setMessages([welcomeMessage(firstName)]);
    }
  }, [currentConversationId, firstName]);

  const loadConversation = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const result = await getConversationMessages(conversationId);
      if (result.success && result.messages) {
        setMessages(
          result.messages.length > 0 ? result.messages : [welcomeMessage(firstName)]
        );
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history (excluding welcome message and current user message)
      const conversationHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const result = await sendMessage(text, currentConversationId, conversationHistory);

      if (result.success && result.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // If a new conversation was created, notify parent
        if (result.conversationId && !currentConversationId && onConversationCreated) {
          onConversationCreated(result.conversationId);
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.error || "I'm sorry, I couldn't process your request. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question);
  };

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getInitials = () => {
    return firstName.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex items-start gap-3 max-w-[80%] ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user" ? "bg-brand-light" : "bg-brand-mid"
                }`}
              >
                {message.role === "user" ? (
                  <span className="text-brand-dark font-semibold text-sm">
                    {getInitials()}
                  </span>
                ) : (
                  <svg
                    className="w-5 h-5 text-white"
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
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-brand-mid text-white rounded-tr-sm"
                      : "bg-brand-surface text-text rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
                {message.role === "assistant" && message.id !== "welcome" && (
                  <button
                    onClick={() => handleCopy(message.content, message.id)}
                    className="self-start flex items-center gap-1.5 px-2 py-1 text-xs text-text-muted hover:text-brand-mid transition-colors"
                    title="Copy message"
                  >
                    {copiedId === message.id ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-mid">
                <svg
                  className="w-5 h-5 text-white"
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
              <div className="px-4 py-3 rounded-2xl bg-brand-surface text-text rounded-tl-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-brand-mid rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-brand-mid rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-brand-mid rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && !currentConversationId && (
        <div className="px-6 pb-4">
          <p className="text-xs text-text-muted mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_COACH_QUESTIONS.map((question) => (
              <button
                key={question}
                onClick={() => handleSuggestedQuestion(question)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-white border border-border rounded-full text-xs text-text-muted hover:border-brand-mid hover:text-brand-mid transition-colors disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about pregnancy, movement, breathing, or MatriVerse..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-brand-surface rounded-xl text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-brand-mid text-white rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
