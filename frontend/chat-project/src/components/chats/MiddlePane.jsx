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
  messages = [],
  onNewMessage,
  currentUserId,
}) {
  const wsRef = useRef();
  const [text, setText] = useState("");

  useEffect(() => {
    if (!chatId) return;
    const ws = new WebSocket(`ws://localhost:8000/chat/ws/direct/${chatId}`);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      onNewMessage({
        id: msg.id,
        position: msg.sender_id === currentUserId ? "right" : "left",
        type: "text",
        text: msg.content,
        title: msg.sender_id === currentUserId ? "You" : friend.full_name,
        date: new Date(msg.timestamp),
      });
    };

    ws.onclose = () => {
      console.log("WebSocket closed for chatId", chatId);
    };

    return () => {
      ws.close();
    };
  }, [chatId, friend, onNewMessage, currentUserId]);

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ content: trimmed }));
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

      {/* Messages Box */}
      <div className={styles.chatsMessagesBox}>
        {messages.map((m) => (
          <MessageBox key={m.id} {...m} />
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
            onChange={(e) => setText(e.target.value)}
            rightButtons={<Button text="Send" onClick={sendMessage} />}
          />
        </div>
      </div>
    </div>
  );
}
