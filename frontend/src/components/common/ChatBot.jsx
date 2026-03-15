import { useState, useRef, useEffect } from "react";
import axios from "axios";

const WELCOME = {
  role: "assistant",
  content: "Hi! Ask me anything about your IT assets — inventory, assignments, warranties, locations and more.",
};

const SUGGESTIONS = [
  "How many products do we have?",
  "Show all products by category",
  "Products with expired warranties?",
  "Show products by department",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-sm w-fit">
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-1 ${
        isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
      }`}>
        {isUser ? "You" : "AI"}
      </div>
      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? "bg-blue-600 text-white rounded-tr-sm"
          : "bg-gray-100 text-gray-800 rounded-tl-sm"
      }`}>
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/chatbot/`,
        { message: msg },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xl flex items-center justify-center transition-all"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{ width: "380px", height: "560px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-400 flex items-center justify-center text-xs font-bold">
              AI
            </div>
            <div>
              <p className="font-semibold text-sm">IT Asset Assistant</p>
              <p className="text-blue-200 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Claude Haiku · SQL Agent
              </p>
            </div>
            <button
              onClick={() => setMessages([WELCOME])}
              title="Clear chat"
              className="ml-auto text-blue-200 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}

            {/* Suggestions — only on fresh chat */}
            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Try asking:</p>
                {SUGGESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => send(q)}
                    className="block w-full text-left text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0 mt-1">
                  AI
                </div>
                <TypingDots />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 px-3 pb-3 pt-2 border-t border-gray-100">
            <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Ask about your assets..."
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none max-h-24"
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white flex items-center justify-center transition shrink-0"
              >
                <svg className="w-3.5 h-3.5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-1.5">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}