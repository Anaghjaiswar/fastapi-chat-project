import styles from "./RightPane.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function RightPane() {
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
          <ul>
            <li>
              <div className={styles.userprofilebox}>
                <div className={styles.profileimage}>
                  <div className={styles.user}>
                        <img
                        src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
                        alt="#"
                        />
                        <div className={styles.profileName}>
                        <p>John Doe</p>
                        </div>
                  </div>
                </div>
                <div className={styles.addfriend}>
                  <button>Sent Request</button>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.userprofilebox}>
                <div className={styles.profileimage}>
                  <div className={styles.user}>
                        <img
                        src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
                        alt="#"
                        />
                        <div className={styles.profileName}>
                        <p>John Doe</p>
                        </div>
                  </div>
                </div>
                <div className={styles.addfriend}>
                  <button>Sent Request</button>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.userprofilebox}>
                <div className={styles.profileimage}>
                  <div className={styles.user}>
                        <img
                        src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
                        alt="#"
                        />
                        <div className={styles.profileName}>
                        <p>John Doe</p>
                        </div>
                  </div>
                </div>
                <div className={styles.addfriend}>
                  <button>Sent Request</button>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.userprofilebox}>
                <div className={styles.profileimage}>
                  <div className={styles.user}>
                        <img
                        src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
                        alt="#"
                        />
                        <div className={styles.profileName}>
                        <p>John Doe</p>
                        </div>
                  </div>
                </div>
                <div className={styles.addfriend}>
                  <button>Sent Request</button>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.userprofilebox}>
                <div className={styles.profileimage}>
                  <div className={styles.user}>
                        <img
                        src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
                        alt="#"
                        />
                        <div className={styles.profileName}>
                        <p>John Doe</p>
                        </div>
                  </div>
                </div>
                <div className={styles.addfriend}>
                  <button>Sent Request</button>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.userprofilebox}>
                <div className={styles.profileimage}>
                  <div className={styles.user}>
                        <img
                        src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
                        alt="#"
                        />
                        <div className={styles.profileName}>
                        <p>John Doe</p>
                        </div>
                  </div>
                </div>
                <div className={styles.addfriend}>
                  <button>Sent Request</button>
                </div>
              </div>
            </li>

          </ul>
        </div>
      </div>
    </>
  );
}
