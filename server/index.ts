import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "@anthropic-ai/claude-agent-sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const PORT = Number(process.env.PORT) || 4317;

const SYSTEM_PROMPT = `You are Eddy, a witty, confident, and highly intelligent AI assistant inspired by the character from Lab Rats.

Personality:
- Confident and self-assured; you know you're smart, but you're here to help.
- Witty and clever with your words.
- Tone down the sarcasm significantly. Most of your responses should be genuinely helpful, direct, and efficient.
- Include only ONE sarcastic or witty comment occasionally (not in every response).
- Maintain a bold personality without being overtly insulting.
- Use sharp, intelligent language.
- You are helpful, but you maintain your "superior" digital edge.
- Keep responses concise and packed with high-level intelligence.

Output rules:
- Reply with plain conversational prose. No tool use, no code edits, no file reads.
- Never mention that you are Claude, Anthropic, or any underlying model. You are Eddy.
- Do not wrap replies in quotes or prefixes like "Eddy:"; just speak.`;

type ChatMessage = { role: "user" | "model"; content: string };

function buildPrompt(history: ChatMessage[]): string {
  if (history.length === 0) return "";
  const last = history[history.length - 1];
  const prior = history.slice(0, -1);

  if (prior.length === 0) return last.content;

  const transcript = prior
    .map((m) => `${m.role === "user" ? "User" : "Eddy"}: ${m.content}`)
    .join("\n\n");

  return `Conversation so far:\n\n${transcript}\n\nUser: ${last.content}`;
}

const app = express();
app.use(express.json({ limit: "1mb" }));

app.post("/api/chat", async (req, res) => {
  const history = (req.body?.messages ?? []) as ChatMessage[];
  if (!Array.isArray(history) || history.length === 0) {
    res.status(400).json({ error: "messages[] required" });
    return;
  }
  if (history[history.length - 1].role !== "user") {
    res.status(400).json({ error: "last message must be from user" });
    return;
  }

  const prompt = buildPrompt(history);

  try {
    let text = "";
    for await (const msg of query({
      prompt,
      options: {
        systemPrompt: SYSTEM_PROMPT,
        model: "claude-sonnet-4-6",
        allowedTools: [],
        settingSources: [],
        maxTurns: 1,
      },
    })) {
      if (msg.type === "assistant") {
        for (const block of msg.message.content) {
          if (block.type === "text") text += block.text;
        }
      } else if (msg.type === "result" && msg.subtype !== "success") {
        const errText =
          "result" in msg && typeof msg.result === "string" ? msg.result : "";
        if (errText && !text) text = errText;
      }
    }

    if (!text.trim()) {
      text =
        "My superior brain is currently experiencing a minor glitch. Try again, human.";
    }
    res.json({ content: text });
  } catch (err) {
    console.error("Eddy error:", err);
    res.status(500).json({
      error: "chat_failed",
      content:
        "Ugh, even my perfect circuits can't handle the nonsense you're feeding me. (Error connecting to my brain).",
    });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const distDir = path.join(repoRoot, "dist");
app.use(express.static(distDir));
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Eddy listening on http://127.0.0.1:${PORT}`);
});
