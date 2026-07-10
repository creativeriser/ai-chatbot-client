import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mic, Send, StopCircle, Volume2, VolumeX, Sparkles, Trash2, Download, Paperclip, X, Plus, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sendMessage } from "../../services/chatApi.js";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition.js";
import { speakText } from "../../hooks/useSpeechSynthesis.js";
import "./ChatInterface.css";

const generateId = () => Math.random().toString(36).substring(2, 9);

const createNewSession = () => ({
  id: generateId(),
  title: "New Chat",
  messages: [{ role: "model", text: "Hello! I am CampusAI. How can I help you today?" }]
});

function ChatInterface() {
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem("campus_ai_sessions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (parsed[0].messages.length > 1) {
            return [createNewSession(), ...parsed];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse chat sessions:", e);
    }
    return [createNewSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession.messages;

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);

  const [selectedImage, setSelectedImage] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeSessionId]);

  // Persist History
  useEffect(() => {
    localStorage.setItem("campus_ai_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const updateSessionMessages = (sessionId, newMessagesOrCallback, newTitle = null) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session;
      const updatedMessages = typeof newMessagesOrCallback === 'function'
        ? newMessagesOrCallback(session.messages)
        : newMessagesOrCallback;

      return {
        ...session,
        messages: updatedMessages,
        title: newTitle || session.title
      };
    }));
  };

  const handleNewChat = () => {
    const newSession = createNewSession();
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInput("");
    setSelectedImage(null);
  };

  const handleDeleteSession = (e, idToDelete) => {
    e.stopPropagation(); // prevent clicking the session row
    if (!window.confirm("Delete this chat?")) return;

    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== idToDelete);
      if (filtered.length === 0) {
        const fresh = createNewSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (idToDelete === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const buildHistory = (msgs) => {
    const firstUserIndex = msgs.findIndex((m) => m.role === "user");
    if (firstUserIndex === -1) return [];
    return msgs.slice(firstUserIndex).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage({
        file,
        previewUrl: URL.createObjectURL(file),
        base64: reader.result.split(',')[1],
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeSelectedImage = () => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setSelectedImage(null);
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend ?? input).trim();
    if ((!text && !selectedImage) || isLoading) return;

    const historyBeforeThisMessage = buildHistory(messages);

    const userMessage = {
      role: "user",
      text: text || "[Sent an image]",
      image: selectedImage?.previewUrl
    };

    // Auto-name title if it's the first user message
    let newTitle = activeSession.title;
    if (messages.filter(m => m.role === "user").length === 0) {
      newTitle = text.slice(0, 30) + (text.length > 30 ? "..." : "");
      if (!newTitle) newTitle = "Image Chat";
    }

    updateSessionMessages(activeSessionId, prev => [...prev, userMessage], newTitle);
    setInput("");
    setIsLoading(true);

    const imagePayload = selectedImage ? { data: selectedImage.base64, mimeType: selectedImage.mimeType } : null;
    removeSelectedImage();

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const reply = await sendMessage(text, historyBeforeThisMessage, imagePayload);
      updateSessionMessages(activeSessionId, prev => [...prev, { role: "model", text: reply }]);
      if (voiceReplyEnabled) speakText(reply);
    } catch (err) {
      updateSessionMessages(activeSessionId, prev => [
        ...prev,
        { role: "model", text: "I'm having trouble reaching my servers. Please check your connection or try again later.", isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportChat = () => {
    const chatText = messages.map(m => `**${m.role === 'user' ? 'You' : 'CampusAI'}**:\n${m.text}\n\n`).join('---\n');
    const blob = new Blob([chatText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CampusAI-${activeSession.title.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const { startListening, isListening, isSupported } = useSpeechRecognition(
    (transcript) => {
      setInput(transcript);
      handleSend(transcript);
    }
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-layout animate-fade-in">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <Link to="/" className="sidebar-brand">
          <Sparkles className="sidebar-logo-icon" />
          <span className="sidebar-logo-text">CampusAI</span>
        </Link>
        <button className="new-chat-btn" onClick={handleNewChat}>
          <Plus size={18} />
          <span>New Chat</span>
        </button>

        <div className="session-list">
          <div className="session-list-header">Recent Chats</div>
          {sessions.map(session => (
            <div
              key={session.id}
              className={`session-item ${session.id === activeSessionId ? 'active' : ''}`}
              onClick={() => setActiveSessionId(session.id)}
            >
              <MessageSquare size={16} className="session-icon" />
              <span className="session-title">{session.title}</span>
              <button
                className="session-delete-btn"
                onClick={(e) => handleDeleteSession(e, session.id)}
                title="Delete Chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-footer-btn" onClick={handleExportChat}>
            <Download size={16} />
            <span>Export Chat</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="chat-interface">
        <div className="chat-container">

          {/* Header Options */}
          <div className="chat-options">
            <button
              className={`voice-toggle-btn ${!voiceReplyEnabled ? 'muted' : ''}`}
              onClick={() => setVoiceReplyEnabled(!voiceReplyEnabled)}
              title={voiceReplyEnabled ? "Mute AI voice" : "Enable AI voice"}
            >
              {voiceReplyEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span className="sr-only">{voiceReplyEnabled ? "Voice on" : "Voice off"}</span>
            </button>
          </div>

          {/* Message Feed */}
          <div className="chat-feed">
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === "model" ? <Sparkles size={16} /> : "U"}
                </div>
                <div className={`message-content ${msg.isError ? 'error' : ''}`}>
                  {msg.image && (
                    <img src={msg.image} alt="User upload" className="message-uploaded-image" />
                  )}
                  {msg.role === "model" && !msg.isError ? (
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-row model">
                <div className="message-avatar"><Sparkles size={16} /></div>
                <div className="message-content typing">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="scroll-anchor" />
          </div>

          {/* Input Area */}
          <div className="chat-input-wrapper">
            {selectedImage && (
              <div className="image-preview-container">
                <img src={selectedImage.previewUrl} alt="Preview" className="image-preview" />
                <button className="remove-image-btn" onClick={removeSelectedImage}>
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="chat-input-container">
              <button
                className="action-btn attach-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Image"
                disabled={isLoading || isListening}
              >
                <Paperclip size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: "none" }}
              />

              <textarea
                ref={textareaRef}
                className="chat-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening to you..." : "Ask CampusAI anything..."}
                disabled={isLoading || isListening}
                rows={1}
              />

              <div className="chat-actions">
                {isSupported && (
                  <button
                    className={`action-btn mic-btn ${isListening ? "listening animate-pulse-glow" : ""}`}
                    onClick={startListening}
                    disabled={isLoading}
                    title={isListening ? "Stop listening" : "Use voice input"}
                  >
                    {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
                  </button>
                )}
                <button
                  className={`action-btn send-btn ${input.trim() || selectedImage ? "active" : ""}`}
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
            <div className="chat-footer-text">
              CampusAI can make mistakes. Consider verifying important information.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
