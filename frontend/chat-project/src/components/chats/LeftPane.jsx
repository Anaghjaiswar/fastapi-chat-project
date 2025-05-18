import styles from "./LeftPane.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown }   from '@fortawesome/free-solid-svg-icons'
import { friendsList } from "../../api/friendsList";
import { useEffect, useState } from "react";
import Loader from "../loader/LoadingSpinner";
import GroupChatButton from "./group-chat/groupChat";
import NewGroupChat from "./group-chat/NewGroupChat";

export default function LeftPane() {
  const [friends, setFriends]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [showNewGroup, setShowNewGroup] = useState(false);

  const loadFriends = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await friendsList();
        setFriends(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(()=>{
      loadFriends();
    }, []);

  return (
    <>
      <div className={styles.leftbox}>
        <div className={styles.contentBox}>
          <p>
            messages {' '}
            <FontAwesomeIcon icon={faCaretDown} />
          </p>
          <div className={styles.creategroupchat}>
            <GroupChatButton onClick={() => setShowNewGroup(true)} />
          </div>
        </div>
        <div className={styles.chatstypes}>
          <div className={styles.allChats}>All</div>
          <div className={styles.personalChats}>Personal</div>
          <div className={styles.groupChats}>Groups</div>
        </div>
        <div className={styles.chatprofiles}>
          {loading && (
            <div className={styles.loadingWrapper}>
              <Loader />
            </div>
          )}
          {error && <p className={styles.error}>{error}</p>}
          <ul>
            {friends.map((friend) => (
            <li key={friend.id} onClick={() => onSelectChat(friend.id)}>
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
            </li>
          ))}
          </ul>
        </div>
        
        {showNewGroup && (
        <NewGroupChat onClose={() => setShowNewGroup(false)} />
      )}
      </div>
    </>
  );
}
