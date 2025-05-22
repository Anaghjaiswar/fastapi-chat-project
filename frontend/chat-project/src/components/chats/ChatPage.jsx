import LeftPane from "./LeftPane";
import MiddlePane from "./MiddlePane";
import RightPane from "./RightPane";
import styles from './ChatPage.module.css';
import TabsMenu from "../tabs/TabsMenu";
import { useState } from "react";
import { createDirectChat } from "../../api/createDirectChat";


export default function ChatPage(){
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [chatId, setChatId]                 = useState(null);
    const [messages, setMessages]             = useState([]);
    const userId = Number(localStorage.getItem("userId"));
     
     const handleSelectChat = async (friend) => {
        try {
        const { id: chatId } = await createDirectChat({ id: friend.id });
        setChatId(chatId);

        // 2) store friendId (or full friend object) so MiddlePane can render name/avatar
        setSelectedFriend(friend);
        } catch (err) {
        console.error("Cannot start chat:", err);
        }
    };


    return(   
    <>
        <div className={styles.ChatPage}>
            <TabsMenu/>
            <LeftPane
                onSelectChat={handleSelectChat}
            />
            {chatId && selectedFriend ? (
                <MiddlePane
                currentUserId={userId}
                chatId={chatId}
                friend={selectedFriend}
                messages={messages}
                onNewMessage={(msg) => setMessages((prev) => [...prev, msg])}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center">
                Select someone to start chatting
                </div>
            )}
            <RightPane/>
        </div>
    </>
    )
}