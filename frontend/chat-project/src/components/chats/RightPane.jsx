import styles from "./RightPane.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { usersList } from "../../api/usersList";
import { sendFriendRequest } from "../../api/sendFriendRequest";

export default function RightPane() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingRequests, setSendingRequests] = useState({});

  useEffect(()=> {
    let isMounted = true;
    (async () => {
      try{
        const data = await usersList()
        if (isMounted) setUsers(data);
      } catch(err){
        setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);
  

  const handleSendRequest = async (userId) => {
    setSendingRequests((prev) => ({...prev, [userId] : true}));

    try{
      await sendFriendRequest(userId);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, requestSent: true } : user
        )
      );
    } catch(err){
      alert(err.message || "Failed to send friend request");

    } finally {
      setSendingRequests((prev) => ({ ...prev, [userId]: false }));
    }

  }

  return (
    <>
      <div className={styles.RightPane}>
        <div className={styles.header}>
          <p>ADD FRIENDS </p>
        </div>
        <div className={styles.searchBox}>
          <input type="search" name="search" id="" aria-label="Search users" />
          <button type="submit" aria-label="Search">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>
        <div className={styles.userslist}>
          {loading && <p>Loading users...</p>}
        {error && <p className={styles.error}>{error}</p>}
        <ul>
          {users.map((user) => (
            <li key={user.id} className={styles.userprofilebox}>
              <div className={styles.profileimage}>
                <img src={user.photo } alt={user.full_name} />
              </div>
              <div className={styles.profileName}>
                <p>{user.full_name}</p>
              </div>
              <div className={styles.addfriend}>
                {user.requestSent ? (
                  <button disabled>Request Sent</button>
                ) : (
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    disabled={sendingRequests[user.id]}
                  >
                    {sendingRequests[user.id] ? "Sending..." : "Add Friend"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </>
  );
}
