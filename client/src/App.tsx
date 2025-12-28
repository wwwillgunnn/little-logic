import { useState } from "react";
import { hcWithType } from "server/dist/client";
import "./App.css";
import beaver from "./assets/beaver.svg";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
const client = hcWithType(SERVER_URL);

type ResponseType = Awaited<ReturnType<typeof client.hello.$get>>;
type HelloJson = Awaited<ReturnType<ResponseType["json"]>>;

function App() {
  const [prompt, setPrompt] = useState("");
  const [data, setData] = useState<HelloJson | undefined>();

  async function sendRequest() {
    try {
      const res = await client.hello.$get();
      if (!res.ok) {
        console.log("Error fetching data");
        return;
      }

      const json = await res.json();
      setData(json);
    } catch (error) {
      console.log(error);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sendRequest();
  }

  return (
    <main>
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
          What Do You <span style={{ color: "#FEBC4C" }}>Need Explained?</span>
        </h1>
      </header>

      <section>
        {/* example prompts should also call route */}
        <p style={{ color: "#6b7280" }}>
          Example prompts to see how LittleLogic works.
        </p>

        <ul className="promptGrid">
          <li className="promptCard">
            explain quantum
            <br />
            physics to me
          </li>

          <li className="promptCard">
            what is the purpose of
            <br />
            personal finances
          </li>

          <li className="promptCard">
            what would it take for
            <br />
            me to go to space
          </li>
        </ul>
      </section>

      {data && (
        <pre className="response">
          <code>
            Message: {data.message} <br />
            Success: {String(data.success)}
          </code>
        </pre>
      )}
      {/* remove things above and make it look like chat UI after submitting */}
      <form onSubmit={handleSubmit}>
        {/* ? Make text area ? */}
        <input
          type="text"
          placeholder="Ask me anything!"
          aria-label="Ask me anything"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </form>

      <i style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "1rem" }}>
        AI can make mistakes, please double check responses.
      </i>
    </main>
  );
}

export default App;
