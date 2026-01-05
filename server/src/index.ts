import { Hono } from "hono";
import { cors } from "hono/cors";
import OpenAI from "openai";
import type { ApiResponse } from "shared/dist";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const app = new Hono()
  .use(cors())

  // .get("/", (c) => {
  //   return c.text("Hello Hono!");
  // })

  .post("/chat", async (c) => {
    const body = await c.req.json<{ message?: string }>();
    const message = body?.message?.trim();

    if (!message) {
      return c.json({ message: "Please send a message." }, 400);
    }

    const resp = await openai.responses.create({
      model: "gpt-5",
      reasoning: { effort: "low" },
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
  });

export default app;
