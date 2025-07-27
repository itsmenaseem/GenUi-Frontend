import axios from "axios";
import { useState, useEffect } from "react";
import Session from "./Session";
import { Plus } from "lucide-react";
import { useSelector } from "react-redux";

const AIChat = ({ onInsertCode, setCode }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const token = useSelector((state)=>state.auth.token)
  // Store per-session UI state: input, messages, image, loading
  const [sessionUI, setSessionUI] = useState({});
  const [sessionCount, setSessionCount] = useState(0);

  // Save current session UI state (input, messages etc)
  const saveCurrentSessionUI = () => {
    if (activeSessionId) {
      setSessionUI((prev) => ({
        ...prev,
        [activeSessionId]: {
          ...prev[activeSessionId],
          input: prev[activeSessionId]?.input ?? "",
          messages: prev[activeSessionId]?.messages ?? [],
          image: prev[activeSessionId]?.image ?? null,
          loading: prev[activeSessionId]?.loading ?? false,
        },
      }));
    }
  };

  // Create new session
  const createNewSession = async () => {
    try {
      const title = `Chat ${sessionCount + 1}`;
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/session/create`,
        { title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      const session = { ...response.data.session, messages: [] };
      setSessions((prev) => [...prev, session]);
      setActiveSessionId(session.session_id);
      setSessionCount((prev) => prev + 1);

      // Initialize UI state for new session
      setSessionUI((prev) => ({
        ...prev,
        [session.session_id]: {
          input: "",
          messages: [],
          image: null,
          loading: false,
        },
      }));
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  // Fetch all sessions and init UI state for each
  const getSessions = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/session/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const sessionsWithEmptyMessages = response.data.sessions.map((s) => ({
        ...s,
        messages: [],
      }));
      setSessions(sessionsWithEmptyMessages);
      setSessionCount(sessionsWithEmptyMessages.length);

      if (sessionsWithEmptyMessages.length > 0) {
        const firstId = sessionsWithEmptyMessages[0].session_id;
        setActiveSessionId(firstId);

        // Initialize UI state for each session
        const uiInit = {};
        for (const s of sessionsWithEmptyMessages) {
          uiInit[s.session_id] = {
            input: "",
            messages: [],
            image: null,
            loading: false,
          };
        }
        setSessionUI(uiInit);
      } else {
        await createNewSession();
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  // Fetch messages for active session and update UI state
  const getMessagesForSession = async (sessionId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/session/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chats = response.data.session.chats || [];

      // ✅ Update visible messages for the current session
      setMessages(chats);

      // ✅ Also store messages in sessionUI for isolation
      setSessionUI((prev) => ({
        ...prev,
        [sessionId]: {
          ...(prev[sessionId] || {}),
          messages: chats,
        },
      }));
    } catch (error) {
      console.error("Error fetching messages for session:", error);

      // Clear messages if failed
      setMessages([]);
      setSessionUI((prev) => ({
        ...prev,
        [sessionId]: {
          ...(prev[sessionId] || {}),
          messages: [],
        },
      }));
    }
  };

  // On activeSessionId change, save current session UI and load new session UI
  useEffect(() => {
    if (!activeSessionId) return;

    // Load session UI state for activeSessionId
    const ui = sessionUI[activeSessionId];
    if (!ui || !ui.messages || ui.messages.length === 0) {
      // Fetch messages if not present
      getMessagesForSession(activeSessionId);
    }
  }, [activeSessionId]);

  // On sessions mount, load them
  useEffect(() => {
    getSessions();
  }, []);

  // Called when user clicks a session tab
  const selectSession = (id) => {
    if (activeSessionId !== null) {
      setSessionUI((prev) => ({
        ...prev,
        [activeSessionId]: {
          input,
          image,
          loading,
          messages,
        },
      }));
    }

    const ui = sessionUI[id] || {};
    setActiveSessionId(id);
    setMessages(ui.messages || []);
    setInput(ui.input || "");
    setImage(ui.image || null);
    setLoading(ui.loading || false);
  };

  // These are local states synced with sessionUI for current activeSessionId
  // Keep them synced with UI cache
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  // Sync local UI state to sessionUI when they change
  useEffect(() => {
    if (!activeSessionId) return;
    setSessionUI((prev) => ({
      ...prev,
      [activeSessionId]: {
        ...(prev[activeSessionId] || {}),
        input,
        image,
        loading,
        messages,
      },
    }));
  }, [input, image, loading, messages, activeSessionId]);

  // Update messages inside sessions array (optional, to keep sessions consistent)
  const updateSessionMessages = (newMessages) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.session_id === activeSessionId ? { ...s, messages: newMessages } : s
      )
    );
  };

  return (
    <div className="flex h-screen font-sans bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg text-gray-800">Conversations</h2>
          <button
            className={`text-sm text-blue-600 hover:text-blue-800 ${
              sessionUI[activeSessionId]?.loading ||
              sessionUI[activeSessionId]?.isSending
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
            onClick={() => {
              if (
                sessionUI[activeSessionId]?.loading ||
                sessionUI[activeSessionId]?.isSending
              ) {
                return; // prevent while loading
              }
              createNewSession();
            }}
            disabled={
              sessionUI[activeSessionId]?.loading ||
              sessionUI[activeSessionId]?.isSending
            }
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map((session) => (
            <button
              key={session.session_id}
              onClick={() => {
                // Prevent tab switch if current session is loading (or sending)
                if (
                  sessionUI[activeSessionId]?.loading ||
                  sessionUI[activeSessionId]?.isSending
                ) {
                  return; // ignore click if loading
                }
                selectSession(session.session_id);
              }}
              disabled={
                sessionUI[activeSessionId]?.loading ||
                sessionUI[activeSessionId]?.isSending
              }
              className={`w-full text-left px-4 py-3 text-sm border-b hover:bg-gray-100 ${
                session.session_id === activeSessionId
                  ? "bg-gray-200 font-medium"
                  : ""
              } ${
                sessionUI[activeSessionId]?.loading ||
                sessionUI[activeSessionId]?.isSending
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              {session.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Chat Window */}
      <Session
        setMessages={setMessages}
        updateSessionMessages={updateSessionMessages}
        messages={messages}
        onInsertCode={onInsertCode}
        setCode={setCode}
        sessions={sessions}
        activeSessionId={activeSessionId}
        input={input}
        setInput={setInput}
        image={image}
        setImage={setImage}
        loading={loading}
        setLoading={setLoading}
      />
    </div>
  );
};

export default AIChat;
