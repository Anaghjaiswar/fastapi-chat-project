// MiddlePane.jsx
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faPhone,
  faMagnifyingGlass,
  faFileArrowUp,
  faPaperPlane,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./MiddlePane.module.css";
import { MessageBox, Input, Button } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import useDebouncedCallback from "../../hooks/useDebouncedCallback";
import MessageOptions from "./MessageOptions";
import { fetchOldMessagesDirect } from "../../api/fetchOldMessagesDirect";
import Loader from "../loader/LoadingSpinner";

export default function MiddlePane({
  chatId,
  friend,
  messages: initialMessages = [],
  onNewMessage,
  currentUserId,
}) {
  const chatBoxRef = useRef();
  const wsRef = useRef(); // <-- Add this line

  const [messages, setMessages] = useState([]);
  const [loadingOldMessages, setLoadingOldMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [offset, setOffset] = useState(0);
  const [typingUsers, setTypingUsers] = useState({});
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null); // <-- Add this line
  const [editText, setEditText] = useState("");     // <-- Add this line
  const [optionsFor, setOptionsFor] = useState(null); // <-- Add this line
  const [hoveredMsgId, setHoveredMsgId] = useState(null); // <-- Add this line

  // Helper to map backend message to frontend shape
  const mapBackendMessage = (msg) => ({
    id: msg.id,
    position: msg.sender_id === currentUserId ? "right" : "left",
    type: msg.type || "text",
    text: msg.content,
    title: msg.sender_id === currentUserId ? "You" : friend.full_name,
    date: new Date(msg.timestamp),
    status: "delivered",
    reactions: {},
    _temp: false,
  });

  // Initial load: fetch last N messages
  useEffect(() => {
    let isMounted = true;
    setLoadingOldMessages(true);
    fetchOldMessagesDirect(chatId, 20, 0)
      .then((msgs) => {
        if (!isMounted) return;
        const mapped = msgs.map(mapBackendMessage);
        setMessages(mapped);
        setOffset(mapped.length);
        setHasMoreMessages(msgs.length === 20);
        // Scroll to bottom after initial load
        setTimeout(() => {
          if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
          }
        }, 0);
      })
      .finally(() => setLoadingOldMessages(false));
    return () => { isMounted = false; };
    // eslint-disable-next-line
  }, [chatId]);

  // Load older messages when scrolled to top
  const loadOldMessages = async () => {
    if (loadingOldMessages || !hasMoreMessages) return;
    setLoadingOldMessages(true);
    try {
      const oldMessagesRaw = await fetchOldMessagesDirect(chatId, 20, offset);
      const oldMessages = oldMessagesRaw.map(mapBackendMessage);
      setMessages((prev) => {
        // Deduplicate by id
        const ids = new Set(prev.map((m) => m.id));
        return [...oldMessages.filter((m) => !ids.has(m.id)), ...prev];
      });
      setOffset((prev) => prev + oldMessages.length);
      if (oldMessages.length < 20) setHasMoreMessages(false);
    } catch (e) {
      // Optionally handle error
    } finally {
      setLoadingOldMessages(false);
    }
  };

  // Scroll handler to detect top scroll
  const handleScroll = () => {
    if (chatBoxRef.current && chatBoxRef.current.scrollTop === 0) {
      loadOldMessages();
    }
  };

  // Attach scroll listener
  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (chatBox) {
      chatBox.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (chatBox) chatBox.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line
  }, [chatBoxRef.current, loadingOldMessages, hasMoreMessages, offset]);

  // Toggle user presence in reaction emoji list
  const updateEmojiList = (prev = [], userId) => {
    const set = new Set(prev);
    if (set.has(userId)) set.delete(userId);
    else set.add(userId);
    return Array.from(set);
  };

  // Render reactions string for message footer
  const renderReactions = (reactions) => {
    if (!reactions) return "";
    return Object.entries(reactions)
      .map(([emoji, userIds]) => (Array.isArray(userIds) && userIds.length > 0 ? `${emoji} × ${userIds.length}` : ""))
      .filter(Boolean)
      .join("  ");
  };

  // Options menu handlers
  const openOptionsForMessage = (id) => setOptionsFor(id);
  const closeOptions = () => setOptionsFor(null);

  // Edit message handlers
  const startEditing = (id, originalText) => {
    setEditingId(id);
    setEditText(originalText);
    closeOptions();
  };
  const submitEditHandler = () => {
    if (editText.trim()) {
      sendAction({ action: "edit", message_id: editingId, content: editText.trim() });
    }
    setEditingId(null);
    setEditText("");
  };

  // WebSocket send helper
  const sendAction = (payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  // Debounced typing indicator
  const debouncedTyping = useDebouncedCallback(() => {
    sendAction({ action: "typing" });
  }, 500);

  // Reactions, delete, reply wrappers
  const toggleReaction = (messageId, emoji) => sendAction({ action: "reaction", message_id: messageId, emoji });
  const submitDelete = (messageId) => sendAction({ action: "delete", message_id: messageId });
  const submitReply = (parentId) => sendAction({ action: "reply", parent_id: parentId, content: "" });

  // WebSocket setup + message handling
  useEffect(() => {
    if (!chatId) return;

    const ws = new WebSocket(`ws://localhost:8000/chat/ws/direct/${chatId}`);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);

      switch (msg.action) {
        case "typing":
          if (msg.user_id !== currentUserId) {
            setTypingUsers((t) => ({ ...t, [msg.user_id]: true }));
            setTimeout(() => setTypingUsers((t) => ({ ...t, [msg.user_id]: false })), 2000);
          }
          break;

        case "reaction":
          setMessages((msgs) =>
            msgs.map((m) =>
              m.id === msg.message_id
                ? {
                    ...m,
                    reactions: {
                      ...m.reactions,
                      [msg.emoji]: updateEmojiList(m.reactions?.[msg.emoji] || [], msg.user_id),
                    },
                  }
                : m
            )
          );
          break;

        case "edit":
          setMessages((msgs) =>
            msgs.map((m) => (m.id === msg.message_id ? { ...m, text: msg.content, edited: true } : m))
          );
          break;

        case "delete":
          setMessages((msgs) =>
            msgs.map((m) =>
              m.id === msg.message_id ? { ...m, text: "This message was deleted", deleted: true } : m
            )
          );
          break;

        case "reply":
          setMessages((msgs) => [
            ...msgs,
            {
              id: msg.id,
              parent_id: msg.parent_id,
              position: msg.sender_id === currentUserId ? "right" : "left",
              type: "text",
              text: msg.content,
              title: msg.sender_id === currentUserId ? "You" : friend.full_name,
              date: new Date(msg.timestamp),
              status: "delivered",
              reactions: {},
              _temp: false,
            },
          ]);
          break;

        case "message":
        default:
          if (msg.sender_id === currentUserId) {
            // Remove temp message with same content & add real message
            setMessages((msgs) =>
              msgs
                .filter(
                  (m) =>
                    !(
                      m._temp &&
                      m.text === msg.content &&
                      m.position === "right"
                    )
                )
                .concat({
                  id: msg.id,
                  position: "right",
                  type: "text",
                  text: msg.content,
                  title: "You",
                  date: new Date(msg.timestamp),
                  status: "sent",
                  reactions: {},
                  _temp: false,
                })
            );
          } else {
            const incoming = {
              id: msg.id,
              position: "left",
              type: "text",
              text: msg.content,
              title: friend.full_name,
              date: new Date(msg.timestamp),
              status: "delivered",
              reactions: {},
              _temp: false,
            };
            setMessages((msgs) => [...msgs, incoming]);
          }

          // Bubble event to parent component if needed
          onNewMessage?.({
            id: msg.id,
            position: msg.sender_id === currentUserId ? "right" : "left",
            type: "text",
            text: msg.content,
            title: msg.sender_id === currentUserId ? "You" : friend.full_name,
            date: new Date(msg.timestamp),
          });
          break;
      }
    };

    ws.onclose = () => console.log("WebSocket closed for chatId", chatId);

    return () => ws.close();
  }, [chatId, friend, onNewMessage, currentUserId]);

  // Send new message with optimistic UI
  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const tempId = Date.now();
    const newTempMsg = {
      _temp: true,
      id: tempId,
      position: "right",
      type: "text",
      text: trimmed,
      title: "You",
      date: new Date(),
      status: "waiting",
      reactions: {},
    };
    setMessages((msgs) => [...msgs, newTempMsg]);

    sendAction({ content: trimmed });
    setText("");
  };

  return (
    <div className={styles.MiddlePane}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.userbox}>
          <div className={styles.userImage}>
            <img src={friend.photo || "https://i.pravatar.cc/40"} alt={friend.full_name} />
          </div>
          <div className={styles.name_status}>
            <div className={styles.name}>
              <p>{friend.full_name}</p>
            </div>
            <div className={styles.status}>
              <p>Online</p>
            </div>
          </div>
        </div>

        <div className={styles.calls}>
          <button className={styles.callButton} aria-label="Video call">
            <FontAwesomeIcon icon={faVideo} />
          </button>
          <button className={styles.callButton} aria-label="Voice call">
            <FontAwesomeIcon icon={faPhone} />
          </button>
        </div>

        <div className={styles.searchMessages}>
          <button type="submit" aria-label="Search messages">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>
      </div>

      {/* Typing indicator */}
      {Object.values(typingUsers).some(Boolean) && (
        <div className={styles.typingIndicator}>{friend.full_name} is typing…</div>
      )}

      {/* Messages Box */}
      <div className={styles.chatsMessagesBox} ref={chatBoxRef}>
        {loadingOldMessages && <Loader />}
        {messages.map((m) => (
          <div key={m.id} className={styles.messageContainer}>
            {editingId === m.id ? (
              <div className={styles.editContainer}>
                <Input
                  multiline={false}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rightButtons={
                    <>
                      <Button text="Save" onClick={submitEditHandler} />
                      <Button icon={<FontAwesomeIcon icon={faTimes} />} onClick={() => setEditingId(null)} />
                    </>
                  }
                />
              </div>
            ) : (
              <MessageBox
                {...m}
                onStringClick={() => toggleReaction(m.id, "👍")}
                onLongPress={() => submitDelete(m.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (!m.deleted) openOptionsForMessage(m.id);
                }}
                status={m.status}
                footer={renderReactions(m.reactions)}
              />
            )}

            {/* options button */}
            {!m.deleted && hoveredMsgId === m.id && (
              <button className={styles.optionsButton} onClick={() => openOptionsForMessage(m.id)} aria-label="Message options">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}

            {/* options panel */}
            {optionsFor === m.id && !m.deleted && (
              <MessageOptions
                message={m}
                onReact={toggleReaction}
                onEdit={startEditing}
                onReply={submitReply}
                onClose={closeOptions}
              />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <label htmlFor="file-upload" className={styles.fileupload} aria-label="Attach file">
          <input id="file-upload" type="file" hidden />
          <FontAwesomeIcon icon={faFileArrowUp} />
        </label>
        <div className={styles.msginput}>
          <Input
            placeholder="Type a message..."
            multiline={false}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              debouncedTyping();
            }}
            rightButtons={
              <Button onClick={sendMessage} style={{ all: "unset" }}>
                <FontAwesomeIcon icon={faPaperPlane} />
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
