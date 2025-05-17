import styles from "./RightPane.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { usersList } from "../../api/usersList";
import { sendFriendRequest } from "../../api/sendFriendRequest";
import RequestsPanel from "./RequestsPanel";
import Loader from "../loader/LoadingSpinner";
import Button from "../button/Button";
import Search from "../search/Search";

export default function RightPane() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingRequests, setSendingRequests] = useState({});
  const [showPanel, setShowPanel] = useState(false);
  const [removingIds, setRemovingIds] = useState(new Set());


  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersList();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSendRequest = async (userId) => {
  // Mark it “removing” so we can animate
  setRemovingIds(prev => new Set(prev).add(userId));

  // After the CSS animation (300ms), actually remove from state
  setTimeout(() => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setRemovingIds(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  }, 400);

  // Fire-and-forget the API call
  try {
    await sendFriendRequest(userId);
  } catch (err) {
    alert(err.message || "Failed to send friend request");
    // on error, re-fetch or re-insert the user so the list stays correct
    fetchUsers();
  }
};


  return (
    <>
      <div className={styles.RightPane}>
        <div className={styles.header}>
          <p>ADD FRIENDS </p>
          <button onClick={() => setShowPanel((v) => !v)}>
            <FontAwesomeIcon icon={faUserGroup} />
          </button>
        </div>
        <div className={styles.searchBox}>
          <Search/>
        </div>
        <div className={styles.userslist}>
          {loading && (
            <div className={styles.loadingWrapper}>
              <Loader />
            </div>
          )}
          {error && <p className={styles.error}>{error}</p>}
          <ul>
            {users.map((user) => (
              <li key={user.id} className={`${styles.userprofilebox} ` + (removingIds.has(user.id) ? styles.removing : "")}>
                <div className={styles.profileimage}>
                  <img
                    src={
                      user.photo ||
                      "https://res.cloudinary.com/dy1a8nyco/image/upload/v1747458258/mfc6mfijkp6rxpchpxtt.jpg"
                    }
                    alt="User Profile"
                  />
                </div>
                <div className={styles.profileName}>
                  <p>{user.full_name}</p>
                </div>
                <div className={styles.addfriend}>
                  {user.requestSent ? (
                    <Button disabled>Request Sent</Button>
                  ) : (
                    <Button
                      onClick={() => handleSendRequest(user.id)}
                      disabled={sendingRequests[user.id]}
                    >
                      {sendingRequests[user.id] ? "Sending..." : "Add Friend"}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        {showPanel && (
          <RequestsPanel
            onClose={() => {
              setShowPanel(false);
              fetchUsers(); // refresh after any accept/cancel
            }}
          />
        )}
      </div>
    </>
  );
}
