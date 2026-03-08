"use client"

import ChatSidebar from '@/componenets/ChatSidebar'
import Loading from '@/componenets/Loading'
import { useAppData, User } from '@/context/AppContext'
import { log } from 'console'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export interface Message{
    _id:string;
    chatId:string;
    sender:string;
    text?:string;
    image?:{
        url:string;
        public_id:string;
    };
     messageType:"text" | "image";
     seen : boolean;
     seenAt: string;
     createdAt:string;
     updatedAt:string;

}

const ChatApp = () => {

  const { loading, isAuth, logoutUser,chats,user : loggedinUser, users, fetchChats,setChats} = useAppData();

  const [selectedUser , setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const router = useRouter()

  useEffect(()=>{
    if(!loading && !isAuth){
      router.push("/login")
    }
  }, [isAuth, loading, router]);

  const handleLogout =  () => logoutUser()

  if(loading){
    return <Loading />
  }

  return (<div className="min-h-screen flex bg-gray-900 text-white relative overflow-hidden"><ChatSidebar sidebarOpen = {sidebarOpen} setSidebarOpen = {setSidebarOpen} showAllUsers = {showAllUsers} setShowAllUsers = {setShowAllUsers} users = {users} loggedinUser = {loggedinUser} chats = {chats} selectedUser = {selectedUser} handleLogout = {handleLogout}/></div>);
}

export default ChatApp