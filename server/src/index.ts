import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = {
  GROQ_API_KEY: string;
};

export const app = new Hono<{ Bindings: Env }>()
  .use(cors())
  .post("/chat", async (c) => {
    const apiKey = c.env.GROQ_API_KEY;

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

    if (!message)
      return c.json({ message: "Please send a message." }, 400);

    if (message.length > 2000)
      return c.json({ message: "Message too long." }, 400);

    try {
      if (!apiKey) {
        return c.json({ message: "Missing GROQ_API_KEY" }, 500);
      }

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content:
                  "You are LittleLogic. Explain like the user is 5. Use simple words, short sentences, and one friendly analogy. Keep it under 8 sentences.",
              },
              {
                role: "user",
                content: message,
              },
            ],
          }),
        },
      );

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      // Debug if something goes wrong
      if (!response.ok) {
        console.error("Groq API error:", data);
        return c.json(
          { message: "Groq API error", error: data },
          502,
        );
      }

      return c.json({
        message:
          data?.choices?.[0]?.message?.content ??
          "I could not think of a reply.",
      });
    } catch (err) {
      console.error("Server error:", err);
      return c.json(
        { message: "Server error", error: String(err) },
        500,
      );
    }
  });

export default app;