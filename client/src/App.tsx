import { useEffect, useRef, useState } from "react";
import { hcWithType } from "server/dist/client";
import "./App.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
const client = hcWithType(SERVER_URL);

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  message: string;
};

function App() {
  // What the user is currently typing in the input box
  const [prompt, setPrompt] = useState("");

  // Mode switch f = landing page, t = chat UI
  const [chatCreated, setChatCreated] = useState(false);

  // Used to disable input and show “Thinking...” while waiting for server
  const [isLoading, setIsLoading] = useState(false);

  // This is the conversation history. Rendering the chat is just mapping this array.
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // A ref to a dummy div at the bottom of chat, used for auto-scrolling
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Whenever messages change (or loading state changes), scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Generates a unique id for each message so React can track list items safely
  function uid() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  // Core function: turns a user text into
  // 1) a user message bubble
  // 2) an API call
  // 3) an assistant message bubble
  async function sendRequest(messageText: string) {
    const trimmed = messageText.trim();
    // Prevent empty messages and prevent spamming while one request is running
    if (!trimmed || isLoading) return;

    // This is what hides the landing page and shows the chat UI
    // React will re-render and the conditional UI below will swap
    setChatCreated(true);

    // 1) Immediately add the user message into the chat history
    const userMsg: ChatMessage = { id: uid(), role: "user", message: trimmed };
    setMessages((prev) => [...prev, userMsg]);

    // 2) Enter loading mode: disable input + show “Thinking…”
    setIsLoading(true);

    try {
      // 3) Call your backend route
      // If you later accept the prompt in query/body, you can pass it here.
      const res = await client.chat.$post({ body: { message: trimmed } });

      // If server returned an error, show a friendly assistant bubble
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            message:
              "Sorry, I couldn’t fetch a response. Try again in a moment.",
          },
        ]);
        return;
      }

      // 4) Parse the JSON response
      const json = await res.json();

      // 5) Add assistant message to chat history (this creates the assistant bubble)
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          message: json.message ?? "Got a response, but it was empty.",
        },
      ]);
    } catch (error) {
      console.log(error);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          message: "Something went wrong while contacting the server.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Send whatever is currently typed in the input
    sendRequest(prompt);

    // Clear input right away for a “chat app” feel
    setPrompt("");
  }

  // Example buttons reuse the same sendRequest logic
  function handleExample(example: string) {
    sendRequest(example);
  }

  return (
    <main>
      {/* Landing page UI: shown only before the first request */}
      {!chatCreated && (
        <>
          <div>
            <img
              src="/public/littleJIT.png"
              className="logo"
              alt="LittleLogic logo"
            />
          </div>

          <header>
            <h1>Hi User!</h1>
            <h1>
              What Do You{" "}
              <span style={{ color: "#FEBC4C" }}>Need Explained?</span>
            </h1>
          </header>

          <section>
            <p style={{ color: "#6b7280", paddingBottom: "1rem" }}>
              Example prompts to see how LittleLogic works.
            </p>

            <div className="promptGrid">
              <button
                className="promptCard"
                type="button"
                onClick={() => handleExample("explain quantum physics to me")}
              >
                explain quantum
                <br />
                physics to me
              </button>

              <button
                className="promptCard"
                type="button"
                onClick={() =>
                  handleExample("what is the purpose of personal finances")
                }
              >
                what is the purpose of
                <br />
                personal finances
              </button>

              <button
                className="promptCard"
                type="button"
                onClick={() =>
                  handleExample("what would it take for me to go to space")
                }
              >
                what would it take for
                <br />
                me to go to space
              </button>
            </div>
          </section>
        </>
      )}

      {/* Chat UI: shown after the first request (chatCreated becomes true) */}
      {chatCreated && (
        <section className="chatShell" aria-label="Chat">
          <div className="chatBody">
            {/* Render the entire conversation from the messages array */}
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user" ? "bubble userBubble" : "bubble botBubble"
                }
              >
                {m.message}
              </div>
            ))}

            {/* While waiting for server, show a temporary assistant bubble */}
            {isLoading && <div className="bubble botBubble">Thinking…</div>}

            {/* This is the “scroll target” at the bottom */}
            <div ref={bottomRef} />
          </div>
        </section>
      )}

      {/* Input is always visible, but placeholder and styling change based on mode */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={
            chatCreated ? "Message LittleLogic…" : "Ask me anything!"
          }
          aria-label="Ask me anything"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />
      </form>

      <i style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "1rem" }}>
        AI can make mistakes, please double check responses.
      </i>
    </main>
  );
}

export default App;
