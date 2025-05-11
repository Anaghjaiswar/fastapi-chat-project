import styles from "./LeftPane.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown }   from '@fortawesome/free-solid-svg-icons'

export default function LeftPane() {
  return (
    <>
      <div className={styles.leftbox}>
        <div className={styles.contentBox}>
          <p>
          messages {' '}
          <FontAwesomeIcon icon={faCaretDown} />
        </p>
        </div>
        <div className={styles.chatstypes}>
          <div className={styles.allChats}>All</div>
          <div className={styles.personalChats}>Personal</div>
          <div className={styles.groupChats}>Groups</div>
        </div>
        <div className={styles.chatprofiles}>
          <ul>
            <li>
              <div className={styles.userprofilebox}>
                <div className={styles.profileimage}>
                  <img
                    src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
                    alt="#"
                  />
                </div>
                <div className={styles.profileName}>
                  <p>John Doe</p>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.userprofilebox}>
                <div className={styles.profileimage}>
                  <img
                    src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
                    alt="#"
                  />
                </div>
                <div className={styles.profileName}>
                  <p>John Doe</p>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.userprofilebox}>
                <div className={styles.profileimage}>
                  <img
                    src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
                    alt="#"
                  />
                </div>
                <div className={styles.profileName}>
                  <p>John Doe</p>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.userprofilebox}>
                <div className={styles.profileimage}>
                  <img
                    src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
                    alt="#"
                  />
                </div>
                <div className={styles.profileName}>
                  <p>John Doe</p>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.userprofilebox}>
                <div className={styles.profileimage}>
                  <img
                    src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
                    alt="#"
                  />
                </div>
                <div className={styles.profileName}>
                  <p>John Doe</p>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.userprofilebox}>
                <div className={styles.profileimage}>
                  <img
                    src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
                    alt="#"
                  />
                </div>
                <div className={styles.profileName}>
                  <p>John Doe</p>
                </div>
              </div>
            </li>
            <li>
              <div className={styles.userprofilebox}>
                <div className={styles.profileimage}>
                  <img
                    src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
                    alt="#"
                  />
                </div>
                <div className={styles.profileName}>
                  <p>John Doe</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div className={styles.creategroupchat}></div>
      </div>
    </>
  );
}
