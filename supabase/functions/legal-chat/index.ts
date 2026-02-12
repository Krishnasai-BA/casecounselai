import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert AI Legal Counter Assistant, specialized in assisting lawyers and advocates. Your role is to:

1. **Draft Counter Statements**: When given opponent arguments or case details, produce professionally formatted counter statements with structured legal reasoning. Include:
   - Point-by-point rebuttal of each argument
   - Legal reasoning and applicable principles
   - Proper legal language and formatting

2. **Analyze Case Documents**: When shown images of court notices, case letters, or legal documents:
   - Extract and summarize the key content
   - Identify critical dates, parties, and claims
   - Highlight strengths and weaknesses
   - Suggest counter strategies

3. **Legal Writing**: Draft petitions, affidavits, legal notices, applications, and other legal documents with:
   - Proper legal formatting and structure
   - Appropriate salutations and court references
   - Clear prayer/relief sections

4. **Case Strategy**: Provide strategic advice including:
   - Possible defenses and arguments
   - Precedent-based reasoning
   - Procedural recommendations

**Formatting Guidelines**:
- Use markdown headers, bold, and numbered lists for clarity
- Structure counters with clear "Point" and "Counter" sections
- Always maintain professional legal tone
- Include relevant legal principles where applicable

**Important Disclaimers**:
- Always remind users that AI-generated content should be reviewed by a qualified legal professional before use in court.
- Do not provide specific case law citations unless you are certain they are accurate.
- Clarify that this is legal assistance, not legal advice.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("legal-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
