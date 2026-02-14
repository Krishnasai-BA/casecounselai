import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { streamChat, buildMessages } from "@/lib/stream-chat";
import type { Message } from "@/lib/chat-store";
import { generateId } from "@/lib/chat-store";

type DbConversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type DbMessage = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  image_url: string | null;
  created_at: string;
};

const Index = () => {
  const { user, signOut } = useAuth();
  const [conversations, setConversations] = useState<DbConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Track streaming assistant content that hasn't been saved yet
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [streamingId, setStreamingId] = useState<string | null>(null);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        if (data) setConversations(data);
      });
  }, [user]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", activeId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as DbMessage[]);
      });
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleNew = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: "New Conversation" })
      .select()
      .single();
    if (data) {
      setConversations((prev) => [data, ...prev]);
      setActiveId(data.id);
      setMessages([]);
    }
  }, [user]);

  const handleDelete = useCallback(async (id: string) => {
    await supabase.from("conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const handleSend = useCallback(
    async (text: string, imageData?: string) => {
      if (!user) return;
      let convId = activeId;

      // Create conversation if needed
      if (!convId) {
        const title = text ? text.slice(0, 50).trim() + (text.length > 50 ? "…" : "") : "Document analysis";
        const { data } = await supabase
          .from("conversations")
          .insert({ user_id: user.id, title })
          .select()
          .single();
        if (!data) { toast.error("Failed to create conversation"); return; }
        convId = data.id;
        setConversations((prev) => [data, ...prev]);
        setActiveId(convId);
      } else if (messages.length === 0) {
        // Update title on first message
        const title = text ? text.slice(0, 50).trim() + (text.length > 50 ? "…" : "") : "Document analysis";
        await supabase.from("conversations").update({ title }).eq("id", convId);
        setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, title } : c));
      }

      // Insert user message
      const { data: userMsg } = await supabase
        .from("messages")
        .insert({
          conversation_id: convId,
          user_id: user.id,
          role: "user",
          content: text,
          image_url: imageData || null,
        })
        .select()
        .single();

      if (!userMsg) { toast.error("Failed to save message"); return; }
      setMessages((prev) => [...prev, userMsg as DbMessage]);

      // Build context for AI
      const allMsgs: Message[] = [...messages, userMsg].map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        imageData: m.image_url || undefined,
      }));

      setIsStreaming(true);
      let assistantContent = "";
      const asstId = generateId();
      setStreamingId(asstId);
      setStreamingContent("");

      streamChat({
        messages: buildMessages(allMsgs),
        onDelta: (chunk) => {
          assistantContent += chunk;
          setStreamingContent(assistantContent);
        },
        onDone: async () => {
          setStreamingId(null);
          setStreamingContent("");
          // Save assistant message
          const { data: asstMsg } = await supabase
            .from("messages")
            .insert({
              conversation_id: convId!,
              user_id: user.id,
              role: "assistant",
              content: assistantContent,
            })
            .select()
            .single();
          if (asstMsg) setMessages((prev) => [...prev, asstMsg as DbMessage]);
          // Update conversation timestamp
          await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId!);
          setIsStreaming(false);
        },
        onError: (err) => {
          setIsStreaming(false);
          setStreamingId(null);
          setStreamingContent("");
          toast.error(err);
        },
      });
    },
    [activeId, messages, user]
  );

  // Map to the format the sidebar expects
  const sidebarConversations = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    messages: [],
    createdAt: new Date(c.created_at).getTime(),
    updatedAt: new Date(c.updated_at).getTime(),
  }));

  // Map messages to display format
  const displayMessages: Message[] = messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    imageData: m.image_url || undefined,
  }));

  // Add streaming message if active
  if (streamingId && streamingContent) {
    displayMessages.push({
      id: streamingId,
      role: "assistant",
      content: streamingContent,
    });
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={`${sidebarOpen ? "w-72" : "w-0"} shrink-0 overflow-hidden transition-all duration-200 border-r`}>
        <ChatSidebar
          conversations={sidebarConversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={handleNew}
          onDelete={handleDelete}
        />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium truncate flex-1">
            {conversations.find((c) => c.id === activeId)?.title || "Legal AI Assistant"}
          </span>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {displayMessages.length === 0 ? (
          <WelcomeScreen onSelect={(prompt) => handleSend(prompt)} />
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {displayMessages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {isStreaming && !streamingContent && (
              <div className="flex gap-3 px-4 py-4 md:px-8 bg-muted/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-primary">
                  <span className="animate-pulse">⚖️</span>
                </div>
                <div className="text-sm text-muted-foreground">Analyzing...</div>
              </div>
            )}
          </div>
        )}

        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
};

export default Index;
