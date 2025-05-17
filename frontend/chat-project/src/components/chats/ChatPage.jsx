import LeftPane from "./LeftPane";
import MiddlePane from "./MiddlePane";
import RightPane from "./RightPane";
import styles from './ChatPage.module.css';
import TabsMenu from "../tabs/TabsMenu";


export default function ChatPage(){
    return(   
    <>
        <div className={styles.ChatPage}>
            <TabsMenu/>
            <LeftPane/>
            <MiddlePane/>
            <RightPane/>
        </div>
    </>
    )
}