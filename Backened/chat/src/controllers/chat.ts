import axios from "axios";
import TryCatch from "../config/TryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/chat.js";
import { Messages } from "../models/messages.js";

export const createNewChat = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const userId = req.user?._id;

    const {otheruserId} = req.body

    if(!otheruserId){
        res.status(400).json({
            message:"Other UserId is Required",
        });
        return;
    }

    // Existing Chat if present
    const exisitingChat = await Chat.findOne({
        users:{$all:[userId,otheruserId],$size:2 },

    });

    if(exisitingChat){
        res.json({
            message:"Chat already exists",
            chatId:exisitingChat._id
        })
        return ;
    }
    const newChat = await Chat.create({
        users:[userId, otheruserId],
    })
    res.status(201).json({
        message:"New Chat created",
        chatId:newChat._id,
    })
});

export const getAllChats = TryCatch(async(req:AuthenticatedRequest, res)=>{
    const userId = req.user?._id;
    if(!userId){
        res.status(400).json({
            message:"User ID Missing",
        });
        return;
    }
    const chats = await Chat.find({users:userId}).sort({updatedAt: -1});

    const chatwWithUserData = await Promise.all(
        chats.map(async(chat)=>{
            const otherUserId = chat.users.find(id=> id !== userId);
            
            const unseenCount = await Messages.countDocuments({
                chatId:chat._id,
                sender:{$ne:userId},
                seen:false,
            });

            try{
                const {data} = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`)

                return {
                    user: data,
                    chat:{
                        ...chat.toObject(),
                        latestMessage:chat.latestMessage || null,
                        unseenCount,
                    }
                }
            }catch(error){
                console.log("error found on ChatwithUserData")
                return {
                    user:{_id:otherUserId,name:"Unknown User"},
                    chat:{
                        ...chat.toObject(),
                        latestMessage:chat.latestMessage || null,
                        unseenCount,
                    }
                }
            }
        })
    );


    res.json({
        chats:chatwWithUserData,
    })


});