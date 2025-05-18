import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styles from "./List.module.css";
import Checkbox from "./checkbox";
import { friendsList } from "../../../api/friendsList";
import Next from "./Next";

export default function List({ selectedIds, onToggle, onNext, onCancel }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await friendsList();
        if (isMounted) setFriends(data);
      } catch (e) {
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <p className={styles.message}>Loading friends…</p>;
  if (error)   return <p className={styles.error}>Error: {error}</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select Group Members</h2>

      <ul className={styles.list}>
        {friends.map((friend) => (
          <li key={friend.id} className={styles.listItem}>
            <div className={styles.userprofilebox}>
              <div className={styles.profileimage}>
                <img
                  src={
                    friend.photo ||
                    "https://res.cloudinary.com/dy1a8nyco/image/upload/v1747458258/mfc6mfijkp6rxpchpxtt.jpg"
                  }
                  alt={friend.full_name}
                />
              </div>
              <div className={styles.profileName}>
                <p>{friend.full_name}</p>
              </div>
            </div>
            <div className="checkbox">
            <Checkbox 
              checked={selectedIds.has(friend.id)}
              onChange={() => onToggle(friend.id)}
            />
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <button
          className={styles.backButton}
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <Next
          label="Next"
          onClick={onNext}
          disabled={selectedIds.size === 0}
        />
      </div>
    </div>
  );
}

List.propTypes = {
  selectedIds: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
