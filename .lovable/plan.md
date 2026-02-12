

# ⚖️ AI Legal Counter Assistant

A professional AI-powered legal chatbot designed for lawyers and advocates to analyze court cases, draft counters, and provide legal strategy assistance.

---

## Page 1: Chat Interface (Main Screen)

A clean, professional light-themed chat interface similar to ChatGPT:

- **Sidebar** with conversation history, ability to create new chats, rename and delete past sessions
- **Main chat area** with message bubbles, markdown rendering for formatted legal documents
- **Input area** with text input, file/photo upload button, and send button
- **Welcome screen** with suggested prompts like "Draft a counter statement", "Analyze this case document", "Write a legal notice"

## Page 2: Features & Capabilities

### Counter Drafting
- User describes the opponent's arguments or uploads case documents
- AI generates professionally formatted counter statements with legal citations and arguments
- Ability to refine and iterate on the counter

### Case Document Analysis
- Upload photos of case letters, court notices, legal documents
- AI reads and extracts text from images (OCR via AI vision)
- Provides summary, key points, strengths, weaknesses, and suggested responses

### Legal Writing
- Draft petitions, affidavits, legal notices, and applications
- AI follows proper legal formatting and language
- Users can specify court type and jurisdiction

### Chat with Context
- Multi-turn conversation — the AI remembers the full case context within a session
- Ask follow-up questions, request modifications, explore different legal strategies

## Design & Experience

- **Professional light theme** with clean typography
- Legal-feel color palette (navy blue accents, white backgrounds, subtle gold highlights)
- Responsive design for desktop and tablet use
- Markdown rendering for properly formatted legal documents
- Copy-to-clipboard for generated legal text

## Backend (Lovable Cloud)

- **AI Integration** via Lovable AI (Gemini model) for legal analysis, counter drafting, and document understanding
- **Edge Function** to handle AI chat with a specialized legal system prompt
- **Image analysis** — photos uploaded are sent to the AI model for vision-based document reading
- Chat history stored locally (browser) for session persistence

---

**Disclaimer**: The app will include a clear disclaimer that AI-generated legal content is for reference only and should be reviewed by a qualified legal professional.

