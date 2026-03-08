"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export const user_service = "http://localhost:5000"
export const chat_service = "http://localhost:5002"

export interface User{
    _id: string;
    name:string;
    email:string;
}

export interface Chat{
    _id:string,
    users:string[];
    latestMessage:{
        text:string;
        sender:string;
    };
    createdAt:string;
    updatedAt:string;
    unseenCount?: number;
}

export interface Chats{
    _id:string
    user:User;
    chat:Chat;
}

interface AppcontextType{
    user: User | null;
    loading: boolean;
    isAuth:boolean;
    setUser: React.Dispatch<React.SetStateAction<User|null>>;
    setIsAuth:React.Dispatch<React.SetStateAction<boolean>>;
    logoutUser: () => Promise<void>;
    fetchUsers: () => Promise<void>;
    fetchChats: () => Promise<void>;
    chats: Chat[] | null;
    users: User[] | null;
    setChats: React.Dispatch<React.SetStateAction<Chat[] | null>>;
}

interface MeResponse{
    user:User
}

const AppContext = createContext<AppcontextType | undefined>(undefined)

interface AppProviderProps {
    children:ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({children})=>{

    const [user , setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    const [chats, setChats] = useState<Chat[] | null>(null)
    const [users, setUsers] = useState<User[] | null>(null)

    async function fetchUser(){
        try {

            const token = Cookies.get("token")

            const { data } = await axios.get<MeResponse>(`${user_service}/api/v1/me`,{
                headers:{
                    Authorization: `Bearer ${token}`,
                }
            });

            setUser(data.user)
            setIsAuth(true)

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false)

        }
    }

    async function logoutUser(){
        Cookies.remove("token");
        setUser(null);
        setIsAuth(false);
        toast.success("Logged out successfully");
    }

    async function fetchChats(){
        const token = Cookies.get("token")

        try {

            const { data } = await axios.get<{chats:Chat[]}>(`${chat_service}/api/v1/chats/all`,{   
                headers:{
                    Authorization: `Bearer ${token}`
                },
            });

            setChats(data.chats);

        } catch (error) {

            console.log(error);

        }
    }

    async function fetchUsers(){
        const token = Cookies.get("token")

        try{

            const { data } = await axios.get<{users:User[]}>(`${user_service}/api/v1/users/all`,{
                headers:{
                    Authorization: `Bearer ${token}`,
                },
            });

            setUsers(data.users);

        }
        catch(error){
            console.log(error);
        }
    }

    useEffect(()=>{
        fetchUser();
        fetchChats();
        fetchUsers();
    },[]);

    return (
        <AppContext.Provider 
        value={{ 
            user,
            setUser,
            isAuth,
            setIsAuth,
            loading,
            logoutUser,
            fetchChats,
            fetchUsers,
            chats,
            users,
            setChats
        }}>
            {children}
            <Toaster position="top-right"/>
        </AppContext.Provider>
    )
}

export const useAppData = (): AppcontextType => {

    const context = useContext(AppContext)

    if(!context){
        throw new Error("useAppData must be used within AppProvider");
    }

    return context
}