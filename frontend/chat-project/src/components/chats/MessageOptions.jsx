// components/chats/MessageOptions.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEdit, faTrash, faReply, faSmile } from "@fortawesome/free-solid-svg-icons";
import styles from "./MessageOptions.module.css";

export default function MessageOptions({
  message,
  onReact,
  onEdit,
  onDelete,
  onReply,
  onClose,
}) {
  return (
    <div className={styles.optionsPanel}>
      <button onClick={() => { onReact(message.id, "👍"); onClose(); }}>
        <FontAwesomeIcon icon={faSmile} /> React
      </button>

      {message.position === "right" && (
        <>
          <button onClick={() => { onEdit(message.id, message.text); onClose(); }}>
            <FontAwesomeIcon icon={faEdit} /> Edit
          </button>
          <button onClick={() => { onDelete(message.id); onClose(); }}>
            <FontAwesomeIcon icon={faTrash} /> Delete
          </button>
        </>
      )}

      <button onClick={() => { onReply(message.id); onClose(); }}>
        <FontAwesomeIcon icon={faReply} /> Reply
      </button>

      <button onClick={onClose} className={styles.closeButton}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
}


