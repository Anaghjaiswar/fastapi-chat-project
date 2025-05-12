import LeftPane from "./LeftPane";
import MiddlePane from "./MiddlePane";
import RightPane from "./RightPane";
import styles from './ChatPage.module.css';

export default function ChatPage(){
    return(   
    <>
        <div className={styles.ChatPage}>
            <LeftPane/>
            <MiddlePane/>
            <RightPane/>
        </div>
    </>
    )
}