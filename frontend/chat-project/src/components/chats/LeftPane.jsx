import styles from "./LeftPane.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { friendsList } from "../../api/friendsList";
import { useEffect, useState } from "react";
import Loader from "../loader/LoadingSpinner";
import GroupChatButton from "./group-chat/GroupChatIcon";
import NewGroupChat from "./group-chat/NewGroupChat";
import { joinedRoomsList } from "../../api/joinedRooms";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dy1a8nyco/image/upload/v1747458258/mfc6mfijkp6rxpchpxtt.jpg";

export default function LeftPane({ onSelectChat, onSelectRoom }) {
  const [friends, setFriends] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'groups'

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fData, rData] = await Promise.all([
        friendsList(),
        joinedRoomsList(),
      ]);
      setFriends(fData);
      setRooms(rData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectChat = (friendId) => {
    onSelectChat?.(friendId);
  };

  const handleSelectRoom = (roomId) => {
    onSelectRoom?.(roomId);
  };

  return (
    <div className={styles.leftbox}>
      <div className={styles.contentBox}>
        <p>
          messages{' '}
          <FontAwesomeIcon icon={faCaretDown} />
        </p>
        <div className={styles.creategroupchat}>
          <GroupChatButton onClick={() => setShowNewGroup(true)} />
        </div>
      </div>

      {/* Tab selectors: Personal / Groups */}
      <div className={styles.chatstypes}>
        <div
          className={`${styles.personalChats} ${
            activeTab === 'personal' ? styles.personalChatsActive : ''
          }`}
          onClick={() => setActiveTab('personal')}
        >
          Personal
        </div>
        <div
          className={`${styles.groupChats} ${
            activeTab === 'groups' ? styles.groupChatsActive : ''
          }`}
          onClick={() => setActiveTab('groups')}
        >
          Groups
        </div>
      </div>

      {/* Chat list based on active tab */}
      <div className={styles.chatprofiles}>
        {loading && (
          <div className={styles.loadingWrapper}>
            <Loader />
          </div>
        )}
        {error && <p className={styles.error}>{error}</p>}

        <ul>
          {activeTab === 'personal' &&
            friends.map((friend) => (
              <li
                key={friend.id}
                onClick={() => handleSelectChat(friend.id)}
              >
                <div className={styles.userprofilebox}>
                  <div className={styles.profileimage}>
                    <img
                      src={friend.photo || DEFAULT_AVATAR}
                      alt={friend.full_name}
                    />
                  </div>
                  <div className={styles.profileName}>
                    <p>{friend.full_name}</p>
                  </div>
                </div>
              </li>
            ))}

          {activeTab === 'groups' &&
            rooms.map((room) => (
              <li key={`r${room.id}`} onClick={() => handleSelectRoom(room.id)}>
                <div className={styles.userprofilebox}>
                  <div className={styles.profileimage}>
                    <img
                      src={room.room_avatar || DEFAULT_AVATAR}
                      alt={room.name}
                    />
                  </div>
                  <div className={styles.profileName}>
                    <p>{room.name}</p>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>

      {showNewGroup && (
        <NewGroupChat
          onClose={() => {
            setShowNewGroup(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
