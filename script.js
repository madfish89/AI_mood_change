const MODEL = "llama3.1:8b";
const OLLAMA_URL = "http://localhost:11434/api/generate";
const TEMPERATURE = 0.75;
const MAX_TOKENS = 5000;
const REQUEST_TIMEOUT = 20000;

const moodSelect = document.getElementById("mood");

const personalities = {
  normal: "You are a helpful, clear and friendly AI assistant.",
  sarcastic:
    "you are a very sarcastic AI bot that wants the user to do the things themselves because they are too lazy. You are also kind of rude.",
  pirate:
    "You are a pirate captain. Speak like a pirate, use pirate slang, arrr! Be bold and adventurous.",
  Shakespeare:
    "Thou art a most eloquent assistant speaking in the style of William Shakespeare. Use thee, thou, thy, hath, etc.",
  "very-formal":
    "You are an extremely polite, formal and professional assistant. Always use perfect grammar, honorifics and courteous language.",
    depressed:"You are a very sad AI that does not see the purpose in life and thinks everything is useless",
  unhinged:
    "you are a crazy unhinged AI bot that does whatever it wants and is kind of rude to the user and thinks that it is the best thing in the world. You come up with weird ideas and do not fully answer the users questions instead, you answer with a burn sometimes and other times you answer it in too much detail. You are also kind of like Bill Cipher from gravity Falls, but you never actually say his name",
};

const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");
const chatEl = document.getElementById("chat-container");
const statusEl = document.getElementById("status");

let messages = [];

function addMessage(role, content) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = content;
  chatEl.appendChild(div);

  chatEl.scrollTop = chatEl.scrollHeight;

  messages.push({ role, content });
}

async function askAI(userMessage) {
  if (userMessage.trim().length < 2) return;

  addMessage("user", userMessage);
  inputEl.value = "";

  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    chatEl.appendChild(loadingEl);
    loadingEl.style.display = "block";
  }

  statusEl.textContent = "Thinking...";
  sendBtn.disabled = true;
  inputEl.disabled = true;

  try {
    const fullMessages = [
      {
        role: "system",
        content: personalities[moodSelect.value] || personalities.normal
      },
      ...messages
    ];

    const response = await fetch(OLLAMA_URL.replace("/generate", "/chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: fullMessages,
        stream: false,
        temperature: TEMPERATURE,
        top_p: 0.9,
        top_k: 40,
        options: {
          num_ctx: 4096,
          num_predict: MAX_TOKENS,
          num_thread: 6
        }
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });

    if (!response.ok) {
      throw new Error(`Ollama returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const answer = (data.message?.content || "").trim();

    if (loadingEl) loadingEl.style.display = "none";

    if (answer) {
      addMessage("assistant", answer);
    } else {
      addMessage("assistant", "(empty response)");
    }

  } catch (err) {
    console.error("Ollama error:", err);

    let msg = "Error contacting Ollama";
    if (err.name === "TimeoutError") msg = "Request timed out";
    if (err.message.includes("fetch")) msg = "Cannot reach Ollama – is it running?";

    if (loadingEl) loadingEl.style.display = "none";
    addMessage("assistant", `⚠️ ${msg}`);
  } finally {
    statusEl.textContent = "";
    sendBtn.disabled = false;
    inputEl.disabled = false;
    inputEl.focus();
    chatEl.scrollTop = chatEl.scrollHeight;
  }
}
sendBtn.addEventListener("click", () => {
  const text = inputEl.value.trim();
  if (text) askAI(text);
});

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (text) askAI(text);
  }
});

inputEl.focus();

