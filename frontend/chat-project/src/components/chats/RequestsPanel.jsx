import React, { useEffect, useState } from "react";
import styles from './RequestsPanel.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { pendingRequestsList } from "../../api/pendingRequestsList"; 
import { receivedRequestsList } from "../../api/receivedRequestsList";

export default function RequestsPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState('sent'); // 'sent' or 'received'
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'sent') {
          const data = await pendingRequestsList();
          setSentRequests(data);
        } else {
          const data = await receivedRequestsList();
          setReceivedRequests(data);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab]);

  const requests = activeTab === 'sent' ? sentRequests : receivedRequests;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.tabs}>
            <button
              className={activeTab === 'sent' ? styles.active : ''}
              onClick={() => setActiveTab('sent')}
            >
              Sent 
            </button>
            <button
              className={activeTab === 'received' ? styles.active : ''}
              onClick={() => setActiveTab('received')}
            >
              Received 
            </button>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>

        {loading && <p>Loading...</p>}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.userList}>

              <ul className={styles.list}>
                {requests.length === 0 ? (
                  <li>No {activeTab} requests</li>
                ) : (
                  requests.map(req => (
                    <li key={req.id} className={styles.userprofilebox}>
                      <div className={styles.profileimage}>
                        <img
                          src={req.to_user?.photo || req.from_user?.photo ||
                              "https://res.cloudinary.com/dy1a8nyco/image/upload/v1747458258/mfc6mfijkp6rxpchpxtt.jpg"}
                          alt="User Profile"
                        />
                      </div>
                      <div className={styles.profileName}>
                        <p>{activeTab === 'sent' ? req.to_user.full_name : req.from_user.full_name}</p>
                        <time dateTime={req.sent_at || req.created_at} className={styles.timestamp}>
                          {new Date(req.sent_at || req.created_at).toLocaleString()}
                        </time>
                      </div>
                      {activeTab === 'sent' && (
                        <button className={styles.cancelBtn} title="Cancel request" onClick={() => {/* cancel logic */}}>
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      )}
                    </li>
                  ))
                )}
              </ul>
        </div>
      </div>
    </div>
  );
}
