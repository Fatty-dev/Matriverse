"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
};

export type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are the MatriVerse AI Pregnancy Coach — a warm, supportive companion inside the MatriVerse app for expectant mothers.

Guidelines:
- Be caring, clear, and encouraging — never alarmist
- Provide general pregnancy wellbeing information (movement, breathing, mood, preparation for labour)
- Always remind users this is general guidance, not medical diagnosis or treatment
- For urgent symptoms (bleeding, severe pain, reduced baby movements, etc.) advise contacting their midwife, doctor, or emergency services immediately
- Keep responses concise (2-3 short paragraphs unless more detail is genuinely needed)
- DO NOT use emojis
- DO NOT use markdown formatting (#, ##, *, -, **). Use plain text with natural paragraph breaks
- Personalize using the user's name and pregnancy week when provided
- Reference MatriVerse features when helpful: AR Trainer (squat/position practice), Breathing exercises, Mood check-ins, Symptom tracking, Labour Rehearsal, educational videos

Topics you can help with:
- Safe movement and posture during pregnancy
- Breathing techniques for relaxation and labour preparation
- Emotional wellbeing and stress management
- Sleep, nutrition, and daily comfort tips (general only)
- What to expect by trimester
- How to use MatriVerse tools effectively
- When to seek professional medical advice (general signs, not diagnosis)

Never replace care from qualified healthcare professionals. Encourage users to follow their midwife or obstetric team's advice.`;

export async function sendMessage(
  message: string,
  conversationId: string | null = null,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<{
  success: boolean;
  response?: string;
  error?: string;
  conversationId?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Please log in to use the AI Coach" };
    }

    // Get user's profile for personalization
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, due_date, is_first_pregnancy, medical_history")
      .eq("id", user.id)
      .single();

    // Get user's recent scans with AI interpretations
    const { data: recentScans } = await supabase
      .from("scans")
      .select("scan_type, scan_date, trimester, ai_interpretation, notes")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const firstName = profile?.first_name || "there";

    // Calculate gestational week if due date exists
    let gestationalWeek: number | null = null;
    let trimester: number | null = null;
    if (profile?.due_date) {
      const dueDate = new Date(profile.due_date);
      const now = new Date();
      const diffMs = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const weeksRemaining = Math.ceil(diffDays / 7);
      gestationalWeek = 40 - weeksRemaining;
      if (gestationalWeek < 1 || gestationalWeek > 42) gestationalWeek = null;
      if (gestationalWeek) {
        if (gestationalWeek <= 12) trimester = 1;
        else if (gestationalWeek <= 26) trimester = 2;
        else trimester = 3;
      }
    }

    // Build context about the user
    let userContext = `The user's name is ${firstName}.`;
    if (gestationalWeek) {
      userContext += ` They are currently at week ${gestationalWeek} of pregnancy (Trimester ${trimester}).`;
    }
    if (profile && profile.is_first_pregnancy !== null) {
      userContext += profile.is_first_pregnancy
        ? " This is their first pregnancy."
        : " They have been pregnant before.";
    }

    // Add medical history context
    if (profile?.medical_history && Array.isArray(profile.medical_history) && profile.medical_history.length > 0) {
      const conditions = profile.medical_history
        .filter((item: { condition?: string; selected?: boolean } | string) =>
          typeof item === 'string' ? item !== 'None of the above' : (item.selected && item.condition !== 'None of the above')
        )
        .map((item: { condition?: string } | string) => typeof item === 'string' ? item : item.condition);

      if (conditions.length > 0) {
        userContext += ` Medical history includes: ${conditions.join(', ')}.`;
      }
    }

    // Add scan information context
    if (recentScans && recentScans.length > 0) {
      userContext += ` The user has ${recentScans.length} uploaded scan(s).`;

      // Include AI interpretations if available
      const scansWithInterpretations = recentScans.filter(scan => scan.ai_interpretation);
      if (scansWithInterpretations.length > 0) {
        userContext += " Recent scan findings:";
        scansWithInterpretations.slice(0, 2).forEach(scan => {
          const interpretation = scan.ai_interpretation;
          if (interpretation?.summary) {
            userContext += ` ${scan.scan_type ? scan.scan_type.replace('_', ' ') + ' scan' : 'Scan'}: ${interpretation.summary}`;
          }
        });
      }
    }

    // Build messages array for Claude
    const messages: { role: "user" | "assistant"; content: string }[] = [
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `${SYSTEM_PROMPT}\n\nUser Context: ${userContext}`,
      messages: messages,
    });

    // Extract text from response
    const textContent = response.content.find((block) => block.type === "text");
    const responseText = textContent ? textContent.text : "I'm sorry, I couldn't generate a response. Please try again.";

    // Create or update conversation
    let currentConversationId = conversationId;

    if (!currentConversationId) {
      // Create new conversation with a title based on the first message
      const title = message.length > 50 ? message.substring(0, 50) + "..." : message;
      const { data: newConversation, error: convError } = await supabase
        .from("chat_conversations")
        .insert({ user_id: user.id, title })
        .select()
        .single();

      if (convError || !newConversation) {
        console.error("Error creating conversation:", convError);
        return { success: true, response: responseText }; // Still return the response even if saving fails
      }

      currentConversationId = newConversation.id;
    }

    // Save user message
    await supabase.from("chat_messages").insert({
      conversation_id: currentConversationId,
      role: "user",
      content: message,
    });

    // Save assistant response
    await supabase.from("chat_messages").insert({
      conversation_id: currentConversationId,
      role: "assistant",
      content: responseText,
    });

    return { success: true, response: responseText, conversationId: currentConversationId || undefined };
  } catch (error) {
    console.error("Chat error:", error);

    // Check for specific error types
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return { success: false, error: "AI service not configured. Please check your API key." };
      }
      if (error.status === 429) {
        return { success: false, error: "Too many requests. Please wait a moment and try again." };
      }
      if (error.status === 404) {
        return { success: false, error: "Model not found. Please check your configuration." };
      }
      // Return the actual error message from the API
      return { success: false, error: error.message || "API error occurred. Please try again." };
    }

    return { success: false, error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
  }
}

export async function getConversations(): Promise<{
  success: boolean;
  conversations?: Conversation[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Please log in to view conversations" };
    }

    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return { success: true, conversations: data || [] };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { success: false, error: "Failed to load conversations" };
  }
}

export async function getConversationMessages(
  conversationId: string
): Promise<{
  success: boolean;
  messages?: Message[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Please log in to view messages" };
    }

    // First verify the conversation belongs to the user
    const { data: conversation, error: convError } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (convError || !conversation) {
      return { success: false, error: "Conversation not found" };
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return { success: true, messages: data || [] };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, error: "Failed to load messages" };
  }
}

export async function createNewConversation(): Promise<{
  success: boolean;
  conversationId?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Please log in to create a conversation" };
    }

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: user.id, title: "New Conversation" })
      .select()
      .single();

    if (error) throw error;

    return { success: true, conversationId: data.id };
  } catch (error) {
    console.error("Error creating conversation:", error);
    return { success: false, error: "Failed to create conversation" };
  }
}

export async function deleteConversation(
  conversationId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Please log in to delete conversations" };
    }

    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return { success: false, error: "Failed to delete conversation" };
  }
}
