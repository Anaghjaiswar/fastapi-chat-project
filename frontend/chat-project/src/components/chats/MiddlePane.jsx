import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faPhone,
  faMagnifyingGlass,
  faFileArrowUp,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./MiddlePane.module.css";

// Dummy messages for demonstration
const dummyMessages = [
  {id: 1, sender: "Alice", name: "Alice Smith", avatar: "https://i.pravatar.cc/40?img=5", text: "Hey there!", time: "10:00 AM"},
  {id: 2, sender: "me", name: "You", avatar: "https://i.pravatar.cc/40?img=3", text: "Hi Alice, how are you?", time: "10:02 AM"},
  {id: 3, sender: "Alice", name: "Alice Smith",avatar: "https://i.pravatar.cc/40?img=5",text: "Doing well, thanks!",time: "10:05 AM"}
];

export default function MiddlePane() {
  return (
    <div className={styles.MiddlePane}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.userbox}>
          <div className={styles.userImage}>
            <img
              src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
              alt="User"
            />
          </div>
          <div className={styles.name_status}>
            <div className={styles.name}>
              <p>Anagh Jaiswar</p>
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
        {dummyMessages.map((msg) => {
          const isMe = msg.sender === "me";
          return (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${
                isMe ? styles.myMessageRow : styles.theirMessageRow
              }`}
            >
              {/* Avatar */}
              <img
                src={msg.avatar}
                alt={msg.name}
                className={styles.messageAvatar}
              />

              <div className={styles.messageContent}>
                {/* Name */}
                <div className={styles.messageName}>{msg.name}</div>

                {/* Bubble */}
                <div
                  className={
                    isMe ? styles.myMessageBubble : styles.theirMessageBubble
                  }
                >
                  <p>{msg.text}</p>
                </div>

                {/* Timestamp */}
                <span className={styles.timestamp}>{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <label
          htmlFor="file-upload"
          className={styles.fileupload}
          aria-label="Attach file"
        >
          <input id="file-upload" type="file" hidden />
          <FontAwesomeIcon icon={faFileArrowUp} />
        </label>
        <div className={styles.msginput}>
          <input
            type="text"
            placeholder="Type a message..."
            aria-label="Type a message"
          />
          <button type="submit" aria-label="Send message">
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
}
