import { Scale, FileText, Search, PenTool } from "lucide-react";

const suggestions = [
  { icon: FileText, label: "Draft a counter statement", prompt: "Draft a counter statement for a civil suit where the plaintiff claims breach of contract regarding a property lease agreement." },
  { icon: Search, label: "Analyze a case document", prompt: "I will upload a case document. Please analyze it and identify key arguments, strengths, weaknesses, and suggest a counter strategy." },
  { icon: PenTool, label: "Write a legal notice", prompt: "Draft a legal notice for non-payment of dues under a service agreement between two companies." },
  { icon: Scale, label: "Counter opponent's arguments", prompt: "The opponent argues that the contract was void due to misrepresentation. Draft a counter addressing each point with supporting legal reasoning." },
];

interface Props {
  onSelect: (prompt: string) => void;
}

export function WelcomeScreen({ onSelect }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Scale className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">Legal Counter Assistant</h2>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        AI-powered assistant for drafting counters, analyzing case documents, and legal writing. Upload photos of case letters or describe your case to get started.
      </p>
      <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => onSelect(s.prompt)}
            className="flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/50"
          >
            <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm font-medium">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
