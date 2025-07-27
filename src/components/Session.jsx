import React, { useState, useRef } from "react";
import axios from "axios";
import {
  ClipboardPaste,
  Copy,
  Check,
  Send,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";

export default function Session({
  setMessages,
  messages,
  sessions,
  updateSessionMessages,
  onInsertCode,
  activeSessionId,
  input,
  setInput,
  image,
  setImage,
  loading,
  setLoading,
  setCode,
}) {
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [insertedIndex, setInsertedIndex] = useState(null);

  // Block input and send until previous response finishes
  const [isSending, setIsSending] = useState(false);
  const token = useSelector((state)=>state.auth.token)
  const handleSend = async () => {
    if (isSending) return; // block multiple sends

    const trimmed = input.trim();
    if (!trimmed && !image) return;

    setIsSending(true);

    const newMessages = [
      ...messages,
      {
        who: "user",
        message: trimmed || "[Image uploaded]",
        id: Date.now()+Math.floor(Math.random()*10000),
      },
    ];

    setMessages(newMessages);
    updateSessionMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const formData = new FormData();
      if (trimmed) formData.append("prompt", trimmed);
      if (image) formData.append("image", image);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/generate-code`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const cleanCode = response.data.code || "No response received.";
      const finalMessages = [
        ...newMessages,
        { who: "ai", message: cleanCode, id: Date.now()  + Math.floor(Math.random()*10000) },
      ];
      await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/session/create-message`,{
        message:finalMessages,session_id:activeSessionId
      },{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })
      if (response.data.code) setCode(response.data.code);

      setMessages(finalMessages);
      updateSessionMessages(finalMessages);
    } catch (error) {
      const errorMsgs = [
        ...newMessages,
        {
          who: "ai",
          message: "Error: Could not generate response. Please try again.",
          id: Date.now() + 1,
          isError: true,
        },
      ];
      setMessages(errorMsgs);
      updateSessionMessages(errorMsgs);
    } finally {
      setLoading(false);
      setImage(null);
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopy = async (text, index) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleInsert = (text, index) => {
    onInsertCode?.(text);
    setInsertedIndex(index);
    setTimeout(() => setInsertedIndex(null), 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="p-4 bg-white border-b shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          {sessions.find((s) => s.session_id === activeSessionId)?.title ||
            "AI Code Assistant"}
        </h1>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {messages && messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-3xl font-semibold mb-2 text-gray-700">
              AI Code Assistant
            </h2>
            <p className="text-lg">
              Ask me to generate code, fix bugs, or explain concepts
            </p>
          </div>
        )}
        {messages &&
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex mb-2 ${
                msg.who === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative max-w-[70%] rounded-xl px-4 py-3 shadow-md ${
                  msg.who === "user"
                    ? "bg-gray-200 text-gray-900"
                    : msg.isError
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-600 text-white"
                } whitespace-pre-wrap break-words text-sm leading-relaxed`}
              >
                {msg.who === "ai" && !msg.isError && (
                  <div className="flex space-x-3 mb-2 justify-end">
                    <button
                      onClick={() => handleInsert(msg.message, msg.id)}
                      className="flex items-center space-x-1 rounded-md bg-opacity-20 px-3 py-1 text-sm text-white hover:bg-opacity-40 transition"
                      title="Insert into editor"
                    >
                      <ClipboardPaste size={16} />
                      <span>{insertedIndex === msg.id ? "Inserted" : "Insert"}</span>
                    </button>
                    <button
                      onClick={() => handleCopy(msg.message, msg.id)}
                      className="flex items-center space-x-1 rounded-md bg-opacity-20 px-3 py-1 text-sm text-white hover:bg-opacity-40 transition"
                      title="Copy code"
                    >
                      {copiedIndex === msg.id ? (
                        <>
                          <Check size={16} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                <div>
                  {msg.who === "user" ? msg.message : msg.message || "Generated Code"}
                </div>
              </div>
            </div>
          ))}

        {loading && (
          <div className="flex justify-end mb-2">
            <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md text-sm">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-5 bg-white border-t border-gray-200 shadow-sm">
        {image && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-700 text-sm">
            <div className="flex items-center gap-2">
              <ImageIcon size={16} />
              <span>{image.name}</span>
              <span className="text-gray-400">
                ({(image.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              onClick={() => {
                setImage(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading || isSending}
            rows={1}
            className="flex-1 min-h-[44px] max-h-[120px] resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm font-sans outline-none bg-white disabled:bg-gray-100"
          />
          <label
            htmlFor="image-upload"
            className={`cursor-pointer rounded-lg border border-gray-300 bg-gray-100 p-3 text-gray-500 hover:text-gray-700 transition ${
              loading || isSending ? "cursor-not-allowed opacity-50" : ""
            }`}
            title="Upload image"
          >
            <ImageIcon size={20} />
            <input
              id="image-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={loading || isSending}
              className="hidden"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>

          <button
            onClick={handleSend}
            disabled={loading || isSending || (!input.trim() && !image)}
            className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition ${
              loading || isSending || (!input.trim() && !image)
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            title="Send message"
          >
            <Send size={18} />
            Send
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-gray-400">
          Press Enter to send | Shift+Enter for new line
        </p>
      </footer>
    </div>
  );
}
