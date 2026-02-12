import { useState, useEffect, useRef, useCallback } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { toast } from "sonner";
import {
  type Conversation,
  type Message,
  loadConversations,
  saveConversations,
  createConversation,
  generateId,
  generateTitle,
} from "@/lib/chat-store";
import { streamChat, buildMessages } from "@/lib/stream-chat";

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) || null;

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [active?.messages]);

  const handleNew = useCallback(() => {
    const c = createConversation();
    setConversations((prev) => [c, ...prev]);
    setActiveId(c.id);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const updateConversation = useCallback((id: string, updater: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }, []);

  const handleSend = useCallback(
    (text: string, imageData?: string) => {
      let convId = activeId;

      if (!convId) {
        const c = createConversation();
        convId = c.id;
        setConversations((prev) => [c, ...prev]);
        setActiveId(convId);
      }

      const userMsg: Message = { id: generateId(), role: "user", content: text, imageData };

      updateConversation(convId, (c) => ({
        ...c,
        title: c.messages.length === 0 ? generateTitle(text || "Document analysis") : c.title,
        messages: [...c.messages, userMsg],
        updatedAt: Date.now(),
      }));

      setIsStreaming(true);
      const assistantId = generateId();
      let assistantContent = "";

      // We need current messages for context
      const currentConv = conversations.find((c) => c.id === convId);
      const allMessages = [...(currentConv?.messages || []), userMsg];

      streamChat({
        messages: buildMessages(allMessages),
        onDelta: (chunk) => {
          assistantContent += chunk;
          const content = assistantContent;
          updateConversation(convId!, (c) => {
            const last = c.messages[c.messages.length - 1];
            if (last?.id === assistantId) {
              return { ...c, messages: c.messages.map((m) => (m.id === assistantId ? { ...m, content } : m)) };
            }
            return { ...c, messages: [...c.messages, { id: assistantId, role: "assistant", content }] };
          });
        },
        onDone: () => setIsStreaming(false),
        onError: (err) => {
          setIsStreaming(false);
          toast.error(err);
        },
      });
    },
    [activeId, conversations, updateConversation]
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-72" : "w-0"} shrink-0 overflow-hidden transition-all duration-200 border-r`}>
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={handleNew}
          onDelete={handleDelete}
        />
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium truncate">{active?.title || "Legal AI Assistant"}</span>
        </div>

        {/* Messages or Welcome */}
        {!active || active.messages.length === 0 ? (
          <WelcomeScreen onSelect={(prompt) => handleSend(prompt)} />
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {active.messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {isStreaming && active.messages[active.messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3 px-4 py-4 md:px-8 bg-muted/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-primary">
                  <span className="animate-pulse">⚖️</span>
                </div>
                <div className="text-sm text-muted-foreground">Analyzing...</div>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
};

export default Index;
