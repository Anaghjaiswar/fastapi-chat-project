import React, { useEffect, useState } from "react";
import styles from './RequestsPanel.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';
import { pendingRequestsList } from "../../api/pendingRequestsList"; 
import { receivedRequestsList } from "../../api/receivedRequestsList";
import { acceptRequest } from "../../api/acceptRequest";
import { cancelRequest } from "../../api/cancelRequest";
import Loader from "../loader/LoadingSpinner";
import Button from "../button/Button";

export default function RequestsPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState('sent');
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

  const handleCancel = async (requestId) => {
    const prevSentRequests = [...sentRequests];
    const prevReceivedRequests = [...receivedRequests];

    setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
    setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));

    try {
      await cancelRequest({ id: requestId });
      
    } catch (e) {
      alert(e.message);
      setSentRequests(prevSentRequests);
      setReceivedRequests(prevReceivedRequests);
    }
  };

  const handleAccept = async (requestId) => {
    const prevReceivedRequests = [...receivedRequests];

    setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
    try {
      await acceptRequest({ id: requestId });
    } catch (e) {
      alert(e.message);
      setReceivedRequests(prevReceivedRequests);
    }
  };

  const requests = activeTab === 'sent' ? sentRequests : receivedRequests;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.tabs}>
            <Button
              className={activeTab === 'sent' ? styles.active : ''}
              onClick={() => setActiveTab('sent')}
            >
              Sent
            </Button>
            <Button
              className={activeTab === 'received' ? styles.active : ''}
              onClick={() => setActiveTab('received')}
            >
              Received
            </Button>
          </div>
          <button onClick={onClose} className={styles.closeBtn} title="Close panel">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>

        {loading && (
            <div className={styles.loadingWrapper}>
              <Loader />
            </div>
          )}
        {error && <p className={styles.error}>{error}</p>}

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
                  <button
                    className={styles.cancelBtn}
                    title="Cancel request"
                    onClick={() => handleCancel(req.id)}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                )}
                {activeTab === 'received' && (
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.acceptBtn}
                      title="Accept request"
                      onClick={() => handleAccept(req.id)}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                      className={styles.rejectBtn}
                      title="Reject request"
                      onClick={() => handleCancel(req.id)}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
