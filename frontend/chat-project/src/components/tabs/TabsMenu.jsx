import styles from './TabsMenu.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBell, 
  faPhone, 
  faCircleNotch, 
  faHardDrive 
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
export default function TabsMenu() {
    return (
        <>
            <div className={styles.tabsmenu}>
                {/* Chat Icon (Logo) */}
                <div className={styles.chatIcon}>
                    <FontAwesomeIcon icon={faWhatsapp} className={styles.icon} />
                </div>

                {/* Tab Options */}
                <div className={styles.tabOptions}>
                    <div className={styles.notifications}>
                        <FontAwesomeIcon icon={faBell} className={styles.icon} />
                        <p>Notifications</p>
                    </div>
                    <div className={styles.calling}>
                        <FontAwesomeIcon icon={faPhone} className={styles.icon} />
                        <p>Calling</p>
                    </div>
                    <div className={styles.statusUpdates}>
                        <FontAwesomeIcon icon={faCircleNotch} className={styles.icon} />
                        <p>Status</p>
                    </div>
                    <div className={styles.storage}>
                        <FontAwesomeIcon icon={faHardDrive} className={styles.icon} />
                        <p>Storage</p>
                    </div>
                </div>

                {/* Profile */}
                <div className={styles.profile}>
                    <img
                        src="https://res.cloudinary.com/dy1a8nyco/image/upload/v1746898770/yqjvhibgc2fpzrgplexm.jpg"
                        alt="Profile"
                        className={styles.profileImage}
                    />
                </div>
            </div>
        </>
    );
}