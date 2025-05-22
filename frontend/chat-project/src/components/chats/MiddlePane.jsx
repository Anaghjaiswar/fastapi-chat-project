import React, { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faPhone,
  faMagnifyingGlass,
  faFileArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./MiddlePane.module.css";
import { MessageBox, Input, Button } from "react-chat-elements";
import "react-chat-elements/dist/main.css";

export default function MiddlePane({
  chatId,
  friend,
  messages: initialMessages = [],
  onNewMessage,
  currentUserId,
}) {
  const wsRef = useRef();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [typingUsers, setTypingUsers] = useState({});

  // helper to toggle a user in an emoji list
  const updateEmojiList = (prev = [], userId) => {
    const set = new Set(prev);
    if (set.has(userId)) set.delete(userId);
    else set.add(userId);
    return Array.from(set);
  };

  // send arbitrary WS action
  const sendAction = (payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  // typing indicator
  let typingTimeout;
  const startTyping = () => {
    sendAction({ action: "typing" });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      /* optionally send stop_typing */
    }, 1000);
  };

  // reaction, edit, delete, reply all just wrap sendAction:
  const toggleReaction = (messageId, emoji) =>
    sendAction({ action: "reaction", message_id: messageId, emoji });
  const submitEdit    = (messageId, content) =>
    sendAction({ action: "edit",    message_id: messageId, content });
  const submitDelete  = (messageId) =>
    sendAction({ action: "delete", message_id: messageId });
  const submitReply   = (parentId, content) =>
    sendAction({ action: "reply",  parent_id: parentId, content });




   useEffect(() => {
    if (!chatId) return;
    const ws = new WebSocket(`ws://localhost:8000/chat/ws/direct/${chatId}`);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);

      switch (msg.action) {
        case "typing":
          setTypingUsers((t) => ({ ...t, [msg.user_id]: true }));
          setTimeout(
            () => setTypingUsers((t) => ({ ...t, [msg.user_id]: false })),
            2000
          );
          break;

        case "reaction":
          setMessages((msgs) =>
            msgs.map((m) =>
              m.id === msg.message_id
                ? {
                    ...m,
                    reactions: {
                      ...m.reactions,
                      [msg.emoji]: updateEmojiList(
                        m.reactions?.[msg.emoji],
                        msg.user_id
                      ),
                    },
                  }
                : m
            )
          );
          break;

        case "edit":
          setMessages((msgs) =>
            msgs.map((m) =>
              m.id === msg.message_id
                ? { ...m, text: msg.content, edited: true }
                : m
            )
          );
          break;

        case "delete":
          setMessages((msgs) =>
            msgs.map((m) =>
              m.id === msg.message_id
                ? { ...m, text: "This message was deleted", deleted: true }
                : m
            )
          );
          break;

        case "reply":
          setMessages((msgs) => [
            ...msgs,
            {
              id: msg.id,
              parent_id: msg.parent_id,
              position:
                msg.sender_id === currentUserId ? "right" : "left",
              type: "text",
              text: msg.content,
              title:
                msg.sender_id === currentUserId ? "You" : friend.full_name,
              date: new Date(msg.timestamp),
            },
          ]);
          break;

        case "message":
        default:
          // append and also bubble up if the parent wants it
          const newMsg = {
            id: msg.id,
            position:
              msg.sender_id === currentUserId ? "right" : "left",
            type: "text",
            text: msg.content,
            title:
              msg.sender_id === currentUserId ? "You" : friend.full_name,
            date: new Date(msg.timestamp),
          };
          setMessages((msgs) => [...msgs, newMsg]);
          onNewMessage?.(newMsg);
          break;
      }
    };

    ws.onclose = () =>
      console.log("WebSocket closed for chatId", chatId);

    return () => ws.close();
  }, [chatId, friend, onNewMessage, currentUserId]);

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendAction({ content: trimmed });
    setText("");
  };

  return (
    <div className={styles.MiddlePane}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.userbox}>
          <div className={styles.userImage}>
            <img
              src={friend.photo || "https://i.pravatar.cc/40"}
              alt={friend.full_name}
            />
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
      {Object.keys(typingUsers).some((id) => typingUsers[id]) && (
        <div className={styles.typingIndicator}>
          {friend.full_name} is typing…
        </div>
      )}

      {/* Messages Box */}
      <div className={styles.chatsMessagesBox}>
        {messages.map((m) => (
          <MessageBox
            key={m.id}
            {...m}
            onStringClick={() => toggleReaction(m.id, "👍")}
            onLongPress={() => submitDelete(m.id)}
            // you can wire up edit & reply similarly
          />
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
              startTyping();
            }}
            rightButtons={<Button text="Send" onClick={sendMessage} />}
          />
        </div>
      </div>
    </div>
  );
}
