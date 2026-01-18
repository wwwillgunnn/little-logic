import { useEffect, useRef, useState } from "react";
import { hcWithType } from "server/dist/client";
import "./App.css";

const SERVER_URL = "https://server.pandapower819.workers.dev";
const client = hcWithType(SERVER_URL);

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  message: string;
};

function App() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]); // conversation history
  const inChatMode = messages.length > 0 || isLoading;

  const bottomRef = useRef<HTMLDivElement | null>(null); // dummy ref to scroll to
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" }); // auto scroll to bottom
  }, [messages]);

  async function sendRequest(messageText: string): Promise<boolean> {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) return false; // ignore empty or concurrent requests

    const userMsg: ChatMessage = { id: uid(), role: "user", message: trimmed };
    setMessages((prev) => [...prev, userMsg]); // add user message to chat history
    setIsLoading(true);

    try {
      const res = await client.chat.$post({ json: { message: trimmed } }); // call backend

      if (!res.ok) {
        pushAssistant("Sorry, I couldn’t process that. Please try again.");
        return false;
      }

      const json: { message?: string } = await res.json();
      pushAssistant(json.message ?? "Got a response, but it was empty."); // add assistant reply to chat history
      return true;
    } catch (error) {
      console.log(error);
      pushAssistant("Something went wrong while contacting the server.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const didSend = await sendRequest(prompt);
    if (didSend) setPrompt("");
  }

  function pushAssistant(text: string) {
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: "assistant", message: text },
    ]);
  }

  function handleExamplePrompt(example: string) {
    sendRequest(example);
  }

  function uid() {
    return crypto.randomUUID(); // Generate a unique id for each message
  }

  return (
    <main>
      {/* Landing page UI: shown only before the first request */}
      {!inChatMode && (
        <>
          <div>
            <img src="/LittleJIT.png" className="logo" alt="LittleLogic logo" />
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
                onClick={() =>
                  handleExamplePrompt("explain quantum physics to me")
                }
              >
                explain quantum
                <br />
                physics to me
              </button>

              <button
                className="promptCard"
                type="button"
                onClick={() =>
                  handleExamplePrompt(
                    "what is the purpose of personal finances",
                  )
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
                  handleExamplePrompt(
                    "what would it take for me to go to space",
                  )
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
      {inChatMode && (
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
            <div ref={bottomRef} />
          </div>
        </section>
      )}

      {/* Input is always visible, but placeholder and styling change based on mode */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={inChatMode ? "Message LittleLogic…" : "Ask me anything!"}
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
