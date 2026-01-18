import { Hono } from "hono";
import { cors } from "hono/cors";
import OpenAI from "openai";

export const app = new Hono().use(cors()).post("/chat", async (c) => {
  // Point OpenAI SDK at Groq's OpenAI-compatible endpoint
  const apiKey = process.env.GROQ_API_KEY;

  const llmClient = apiKey
    ? new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" })
    : null;

  let body: { message?: string } | null = null;

  // Safely parse JSON
  try {
    body = await c.req.json();
  } catch {
    return c.json(
      { message: 'Invalid JSON. Send: { "message": "hello" }' },
      400,
    );
  }

  const message = (body?.message ?? "").trim();
  if (!message) return c.json({ message: "Please send a message." }, 400);
  if (message.length > 2000)
    return c.json({ message: "Message too long." }, 400);

  try {
    if (!llmClient) return c.json({ message: "Missing GROQ_API_KEY" }, 500);

    const resp = await llmClient.responses.create({
      model: "llama-3.1-8b-instant",
      instructions:
        "You are LittleLogic. Explain the user's message like they are 5 years old. " +
        "Use simple words, short sentences, and one friendly analogy. " +
        "Keep it under 8 sentences. " +
        "If the user asks for code, give a tiny example. " +
        "If the question is missing key info, ask exactly one short follow-up question.",
      input: message,
    });

    return c.json({
      message: resp.output_text ?? "I could not think of a reply.",
    });
  } catch (err) {
    console.error("Groq(OpenAI-compat) error:", err);
    return c.json(
      { message: "Groq request failed. Check server logs for details." },
      502,
    );
  }
});

export default app;
