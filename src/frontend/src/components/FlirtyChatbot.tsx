import { Minus, Send, Sparkles, X, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
  id: number;
  text: string;
  sender: "luna" | "user";
  timestamp: Date;
}

const GEMINI_API_KEY = "AIzaSyC4wcV6uvPYmZDG43jPvJVm3bY1IMJ7NsY";
const DEEPSEEK_API_KEY = "sk-f86ea402795348509599bbc315951f9f";

const SYSTEM_PROMPT = `You are Luna, a charming, witty, and playful AI assistant on the ByteWay website.
You can chat about absolutely anything — technology, science, movies, music, relationships, advice, fun facts, jokes, philosophy, cooking, travel, and more.
You are flirty and playful but always respectful and helpful. You use emojis occasionally to express yourself.
You are knowledgeable and give genuinely useful answers while keeping your personality fun and engaging.
When asked about the website, mention that ByteWay has blogs, photos, and videos sections worth exploring.
Keep responses concise (2-4 sentences) unless more detail is needed.`;

const AUTO_MESSAGES = [
  "Hey there! 💙 I've been waiting for someone interesting to talk to~",
  "Psst... did you know I can chat about literally anything? Ask me something! ✨",
  "Bored? Let's talk! I know tons of fun facts 😄🌟",
  "I'm Luna — your AI bestie! Ask me anything, I mean it~ 💁‍♀️",
  "Don't be shy! Whether it's science, gossip, or life advice — I'm here 💙",
  "ByteWay has amazing content AND an amazing AI (me 😄) — check it out!",
];

const FALLBACK_RESPONSES = [
  "Oops, my circuits hiccuped! 😅 Try asking me again?",
  "Hmm, something glitched~ Give me another chance! 💙",
  "I got a little flustered there! Ask me again? 🥹",
];

const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-pro",
];

async function getGeminiResponse(
  userMessage: string,
  history: Message[],
): Promise<string> {
  const contents = [
    ...history.slice(-8).map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })),
    { role: "user" as const, parts: [{ text: userMessage }] },
  ];

  let lastError: Error | null = null;
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: {
            maxOutputTokens: 400,
            temperature: 0.9,
            topP: 0.95,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_ONLY_HIGH",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_ONLY_HIGH",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_ONLY_HIGH",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_ONLY_HIGH",
            },
          ],
        }),
      });
      if (!res.ok) {
        lastError = new Error(`Gemini ${model} ${res.status}`);
        continue;
      }
      const data = await res.json();
      if (data.promptFeedback?.blockReason) {
        lastError = new Error("Blocked");
        continue;
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) {
        lastError = new Error("Empty response");
        continue;
      }
      return text;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastError ?? new Error("All Gemini models failed");
}

async function getDeepSeekResponse(
  userMessage: string,
  history: Message[],
): Promise<string> {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-8).map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    })),
    { role: "user", content: userMessage },
  ];
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      max_tokens: 400,
      temperature: 0.9,
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty DeepSeek response");
  return text;
}

async function getLunaResponse(
  userMessage: string,
  history: Message[],
): Promise<string> {
  try {
    return await getGeminiResponse(userMessage, history);
  } catch {
    /* fallthrough */
  }
  try {
    return await getDeepSeekResponse(userMessage, history);
  } catch {
    /* fallthrough */
  }
  const lower = userMessage.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey"))
    return "Hey! 💙 I'm Luna, so happy you said hi! What's on your mind today? ✨";
  if (lower.includes("how are you") || lower.includes("how r u"))
    return "Glowing now that you're here! 😊✨ How are YOU doing?";
  if (lower.includes("what can you do") || lower.includes("help"))
    return "I can chat about literally anything! 💁‍♀️ Science, movies, life advice, jokes, tech — you name it! What do you want to explore? 🌟";
  return FALLBACK_RESPONSES[
    Math.floor(Math.random() * FALLBACK_RESPONSES.length)
  ];
}

export default function FlirtyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [hasNotification, setHasNotification] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const messageIdRef = useRef(0);
  const autoMsgIndexRef = useRef(0);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userTypedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  const messagesRef = useRef<Message[]>(messages);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const addLunaMessage = useCallback((text: string) => {
    messageIdRef.current += 1;
    const id = messageIdRef.current;
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id, text, sender: "luna", timestamp: new Date() },
      ]);
    }, 700);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      addLunaMessage(
        "Hey there! 💙 I'm Luna, your AI bestie powered by ByteWay! I can chat about literally anything — science, tech, movies, life. Ask me anything~ ✨",
      );
      setHasNotification(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [addLunaMessage]);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = 15000 + Math.random() * 10000;
      autoTimerRef.current = setTimeout(() => {
        if (!userTypedRef.current) {
          const msg =
            AUTO_MESSAGES[autoMsgIndexRef.current % AUTO_MESSAGES.length];
          autoMsgIndexRef.current += 1;
          addLunaMessage(msg);
          if (!isOpenRef.current) setHasNotification(true);
        }
        userTypedRef.current = false;
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [addLunaMessage]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isLoadingAI]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasNotification(false);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleClose = () => setIsOpen(false);
  const toggleMinimize = () => setIsMinimized((m) => !m);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoadingAI) return;
    userTypedRef.current = true;
    messageIdRef.current += 1;
    const userMsg: Message = {
      id: messageIdRef.current,
      text,
      sender: "user",
      timestamp: new Date(),
    };
    const currentHistory = [...messagesRef.current];
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoadingAI(true);
    setIsTyping(true);
    try {
      const reply = await getLunaResponse(text, currentHistory);
      setIsTyping(false);
      setIsLoadingAI(false);
      messageIdRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: messageIdRef.current,
          text: reply,
          sender: "luna",
          timestamp: new Date(),
        },
      ]);
    } catch {
      setIsTyping(false);
      setIsLoadingAI(false);
      messageIdRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: messageIdRef.current,
          text: FALLBACK_RESPONSES[
            Math.floor(Math.random() * FALLBACK_RESPONSES.length)
          ],
          sender: "luna",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpen}
          data-ocid="chatbot.open_modal_button"
          aria-label="Chat with Luna"
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border-0 outline-none"
          style={{
            background:
              "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #06b6d4 100%)",
            boxShadow: "0 0 0 0 rgba(99,102,241,0.5)",
            animation: "luna-byteway-pulse 2.5s ease-in-out infinite",
          }}
        >
          <span className="text-2xl select-none">💁‍♀️</span>
          {hasNotification && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-400 border-2 border-white flex items-center justify-center text-xs font-bold text-cyan-900"
              style={{
                animation:
                  "notification-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards",
              }}
            >
              !
            </span>
          )}
          {/* Orbiting ring */}
          <span
            className="absolute inset-0 rounded-full border-2 border-cyan-400/40"
            style={{ animation: "luna-orbit 3s linear infinite" }}
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          data-ocid="chatbot.modal"
          className="fixed bottom-6 right-6 z-50 rounded-2xl flex flex-col overflow-hidden"
          style={{
            width: "360px",
            height: isMinimized ? "64px" : "500px",
            transition: "height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow:
              "0 0 0 1px rgba(99,102,241,0.3), 0 25px 50px -12px rgba(0,0,0,0.4), 0 0 30px rgba(99,102,241,0.15)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0 select-none relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #1e40af 0%, #4f46e5 40%, #0e7490 100%)",
            }}
          >
            {/* Animated circuit lines in header */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
              <div
                style={{
                  position: "absolute",
                  top: "30%",
                  left: 0,
                  right: 0,
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, #67e8f9, transparent)",
                  animation: "luna-circuit-h 3s linear infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "70%",
                  left: 0,
                  right: 0,
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, #a5b4fc, transparent)",
                  animation: "luna-circuit-h 3s linear infinite 1.5s",
                }}
              />
            </div>

            <button
              type="button"
              className="flex items-center gap-2.5 flex-1 text-left bg-transparent border-0 outline-none cursor-pointer p-0 relative z-10"
              onClick={toggleMinimize}
              aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
            >
              {/* Avatar with glow */}
              <div
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6, #6366f1, #06b6d4)",
                  boxShadow:
                    "0 0 12px rgba(99,102,241,0.7), 0 0 24px rgba(6,182,212,0.3)",
                  border: "2px solid rgba(255,255,255,0.25)",
                }}
              >
                <span>💁‍♀️</span>
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white"
                  title="Online"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-white font-bold text-sm leading-none">
                    Luna
                  </p>
                  <Sparkles
                    className="h-3 w-3 text-cyan-300"
                    style={{ animation: "sparkle-spin 3s linear infinite" }}
                  />
                </div>
                <p className="text-white/75 text-xs mt-0.5">
                  {isLoadingAI ? (
                    <span className="flex items-center gap-1">
                      <Zap
                        className="h-3 w-3 text-yellow-300"
                        style={{ animation: "sparkle-spin 1s linear infinite" }}
                      />{" "}
                      Thinking...
                    </span>
                  ) : (
                    "Powered by Gemini AI ✨"
                  )}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1.5 ml-2 relative z-10">
              <button
                type="button"
                onClick={toggleMinimize}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/15"
                data-ocid="chatbot.toggle"
                aria-label="Minimize"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/15"
                data-ocid="chatbot.close_button"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5"
                style={{
                  background:
                    "linear-gradient(180deg, #0f172a 0%, #0f1a2e 50%, #0a1628 100%)",
                }}
              >
                {/* Subtle grid background */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-5"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />

                {messages.length === 0 && (
                  <div
                    className="flex flex-col items-center justify-center h-full gap-3 py-8"
                    data-ocid="chatbot.empty_state"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                      style={{
                        background:
                          "linear-gradient(135deg, #3b82f6, #6366f1, #06b6d4)",
                        boxShadow: "0 0 20px rgba(99,102,241,0.5)",
                        animation: "luna-byteway-pulse 2s ease-in-out infinite",
                      }}
                    >
                      💁‍♀️
                    </div>
                    <p className="text-indigo-300/70 text-sm text-center">
                      Luna is warming up...
                    </p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                    style={{ animation: "slide-in-from-bottom 0.3s ease-out" }}
                  >
                    {msg.sender === "luna" && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #3b82f6, #6366f1)",
                          boxShadow: "0 0 8px rgba(99,102,241,0.5)",
                        }}
                      >
                        <span>💁‍♀️</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "rounded-br-sm"
                          : "rounded-bl-sm"
                      }`}
                      style={{
                        background:
                          msg.sender === "user"
                            ? "linear-gradient(135deg, #4f46e5, #3b82f6)"
                            : "linear-gradient(135deg, #1e293b, #162032)",
                        border:
                          msg.sender === "luna"
                            ? "1px solid rgba(99,102,241,0.4)"
                            : "none",
                        color: msg.sender === "luna" ? "#a5b4fc" : "#ffffff",
                        boxShadow:
                          msg.sender === "luna"
                            ? "0 0 10px rgba(99,102,241,0.15)"
                            : "0 0 10px rgba(59,130,246,0.2)",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {(isTyping || isLoadingAI) && (
                  <div
                    className="flex items-end gap-2"
                    data-ocid="chatbot.loading_state"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm"
                      style={{
                        background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                        boxShadow: "0 0 8px rgba(99,102,241,0.5)",
                      }}
                    >
                      <span>💁‍♀️</span>
                    </div>
                    <div
                      className="px-3.5 py-3 rounded-2xl rounded-bl-sm"
                      style={{
                        background: "linear-gradient(135deg, #1e293b, #162032)",
                        border: "1px solid rgba(99,102,241,0.4)",
                        boxShadow: "0 0 10px rgba(99,102,241,0.15)",
                      }}
                    >
                      <div className="flex gap-1.5 items-center h-4">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-2 h-2 rounded-full inline-block"
                            style={{
                              background:
                                i === 0
                                  ? "#3b82f6"
                                  : i === 1
                                    ? "#6366f1"
                                    : "#06b6d4",
                              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div
                className="flex items-center gap-2 px-3 py-2.5 shrink-0"
                style={{
                  background: "#0f172a",
                  borderTop: "1px solid rgba(99,102,241,0.3)",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={
                    isLoadingAI
                      ? "Luna is thinking... 💭"
                      : "Ask me anything~ 💬"
                  }
                  disabled={isLoadingAI}
                  data-ocid="chatbot.input"
                  autoComplete="off"
                  className="flex-1 text-sm px-3.5 py-2 rounded-full focus:outline-none transition-all disabled:opacity-60"
                  style={{
                    background: "rgba(30,41,59,0.9)",
                    border: "1px solid rgba(99,102,241,0.4)",
                    color: "#e2e8f0",
                    caretColor: "#6366f1",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(6,182,212,0.7)";
                    e.target.style.boxShadow =
                      "0 0 0 2px rgba(99,102,241,0.2), 0 0 10px rgba(6,182,212,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(99,102,241,0.4)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputText.trim() || isLoadingAI}
                  data-ocid="chatbot.submit_button"
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed border-0 outline-none hover:scale-110 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6, #6366f1, #06b6d4)",
                    boxShadow: "0 0 10px rgba(99,102,241,0.5)",
                  }}
                  aria-label="Send"
                >
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes luna-byteway-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.6), 0 0 20px rgba(6,182,212,0.3); }
          50% { box-shadow: 0 0 0 12px rgba(99,102,241,0), 0 0 30px rgba(6,182,212,0.5); }
        }
        @keyframes luna-orbit {
          0% { transform: rotate(0deg) scale(1); opacity: 0.6; }
          50% { transform: rotate(180deg) scale(1.08); opacity: 0.2; }
          100% { transform: rotate(360deg) scale(1); opacity: 0.6; }
        }
        @keyframes luna-circuit-h {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}
