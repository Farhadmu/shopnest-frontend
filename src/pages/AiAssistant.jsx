import { useState, useRef, useEffect } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const AiAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your ShopNest AI shopping assistant. Tell me what you're looking for — budget, category, or use case — and I'll help you find it." },
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", { message: userMsg.content, conversationId });
      setConversationId(data.data.conversationId);
      setMessages((m) => [...m, { role: "assistant", content: data.data.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I ran into an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-lg font-bold mb-2">AI Shopping Assistant</h1>
        <p className="text-gray-500 mb-4">Please log in to chat with the AI assistant.</p>
        <Link to="/login" className="btn-primary inline-block">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[80vh]">
      <h1 className="text-lg font-bold mb-4">✨ AI Shopping Assistant</h1>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                m.role === "user" ? "bg-brand-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-sm text-gray-400">AI is typing...</div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="mt-4 flex gap-2">
        <input
          className="input"
          placeholder="e.g. I need a laptop for programming under 80,000 taka"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading}>Send</button>
      </form>
    </div>
  );
};

export default AiAssistant;
