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

const SYSTEM_PROMPT = `You are a caring and knowledgeable AI pregnancy coach named MatriVerse Assistant. Your role is to provide helpful, supportive guidance to pregnant women.

Guidelines:
- Be warm, empathetic, and professional in your responses
- Provide evidence-based information about pregnancy, nutrition, exercise, and symptoms
- Always remind users to consult their healthcare provider for medical advice
- Keep responses concise but informative (2-3 paragraphs max unless more detail is needed)
- Use bullet points for lists to improve readability
- DO NOT use emojis in your responses - maintain a professional, refined tone
- If asked about emergency symptoms (heavy bleeding, severe pain, no fetal movement), urgently advise seeking immediate medical care
- Never diagnose conditions or prescribe medications
- Be culturally sensitive and inclusive
- Personalize responses using the user's name sparingly and naturally

Topics you can help with:
- Common pregnancy symptoms and management
- Safe exercises during pregnancy
- Nutrition and foods to eat/avoid
- Sleep tips
- Emotional wellbeing
- Preparing for labor and delivery
- General pregnancy milestones and what to expect

Always end concerning symptom discussions with a reminder to contact their healthcare provider.`;

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
      .select("first_name, due_date, is_first_pregnancy")
      .eq("id", user.id)
      .single();

    const firstName = profile?.first_name || "there";

    // Calculate gestational week if due date exists
    let gestationalWeek: number | null = null;
    if (profile?.due_date) {
      const dueDate = new Date(profile.due_date);
      const now = new Date();
      const diffMs = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const weeksRemaining = Math.ceil(diffDays / 7);
      gestationalWeek = 40 - weeksRemaining;
      if (gestationalWeek < 1 || gestationalWeek > 42) gestationalWeek = null;
    }

    // Build context about the user
    let userContext = `The user's name is ${firstName}.`;
    if (gestationalWeek) {
      userContext += ` They are currently at week ${gestationalWeek} of pregnancy.`;
    }
    if (profile && profile.is_first_pregnancy !== null) {
      userContext += profile.is_first_pregnancy
        ? " This is their first pregnancy."
        : " They have been pregnant before.";
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
