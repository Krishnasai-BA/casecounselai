import { Plus, MessageSquare, Trash2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Conversation } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function ChatSidebar({ conversations, activeId, onSelect, onNew, onDelete }: Props) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-4">
        <Scale className="h-6 w-6 text-primary" />
        <h1 className="text-base font-semibold tracking-tight">Legal AI</h1>
      </div>

      {/* New chat button */}
      <div className="p-3">
        <Button onClick={onNew} variant="outline" className="w-full justify-start gap-2 border-sidebar-border">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 pb-4">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={cn(
                "group flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors",
                activeId === c.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50"
              )}
              onClick={() => onSelect(c.id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
              <span className="flex-1 truncate">{c.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Disclaimer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-[10px] leading-tight text-muted-foreground">
          AI-generated content is for reference only. Always consult a qualified legal professional.
        </p>
      </div>
    </div>
  );
}
