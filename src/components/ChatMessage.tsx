import ReactMarkdown from "react-markdown";
import { Scale, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Message } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex gap-3 px-4 py-4 md:px-8", isUser ? "" : "bg-muted/40")}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        isUser ? "bg-primary text-primary-foreground" : "bg-accent/20 text-primary"
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="text-xs font-medium text-muted-foreground">
          {isUser ? "You" : "Legal AI Assistant"}
        </div>
        {message.imageData && (
          <img src={message.imageData} alt="Uploaded document" className="max-w-xs rounded-lg border" />
        )}
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose-legal text-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        {!isUser && message.content && (
          <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}
