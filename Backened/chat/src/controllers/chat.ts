import axios from "axios";
import TryCatch from "../config/TryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/chat.js";
import { Messages } from "../models/messages.js";
import { text } from "express";

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

export const sendMessage = TryCatch(async(req:AuthenticatedRequest, res)=>{
    const senderId = req.user?._id;
    const chatId = req.body?.chatId;
    const text = req.body?.text;

    const imageFile = req.file;

    console.log("Received message data:", { senderId, chatId, text, imageFile });

    if(!senderId){
        res.status(401).json({
            message:"Unauthorized Access ",
        });
        return;
    }
    if(!chatId){
        res.status(400).json({
            message:"Chat ID Not Found",
        });
        return;
    }
    if(!text && !imageFile){
        res.status(400).json({
            message:"Message content or image is required",
        });
        return;
    }

    const chat = await Chat.findById(chatId);

    if(!chat){
        res.status(404).json({
            message:"Chat not Found",
        });
        return; 
    }

    const isUserInChat = chat.users.some((userId)=> userId.toString() === senderId.toString());
    if(!isUserInChat){
        res.status(403).json({
            message:"Unauthorized Access, You are not a participant of this chat",
        });
        return;
    }

    const otherUserId = chat.users.find((userId)=> userId.toString() !== senderId.toString());

    if(!otherUserId){
        res.status(401).json({
            message:"No other user found in this chat",
        });
        return;
    }

    //socket setup

    let messageData:any = {
        chatId : chatId,
        sender:  senderId,
        seen: false,
        seenAt : undefined,
    };

    if(imageFile){
        messageData.image = {
            url : imageFile.path,
            public_id : imageFile.filename,
        };

        messageData.messageType = "image";  
        messageData.text = text || "";
    }else{
        messageData.text = text;
        messageData.messageType = "text";
    }

    const message = new Messages(messageData);

    const savedMessage = await message.save();

    const latestMessageText = imageFile ? "Image" : text;

    await Chat.findByIdAndUpdate(chatId, {
        latestMessage : {
            text: latestMessageText,
            sender : senderId,
        },
        updatedAt : new Date(), 
    },{new:true});

    //emit to sockets

    res.status(201).json({
        message: savedMessage,
        sender: senderId,
    }); 
});

export const getMessagesByChat = TryCatch(async(req:AuthenticatedRequest, res)=>{
        const userId = req.user?._id;   
        const {chatId} = req.params;

        if(!userId){
        res.status(401).json({
            message:"Unauthorized",
        });
        return;
        }
        if(!chatId){
        res.status(400).json({
            message:"Chat ID is required",
        });
        return;
        }

        const chat = await Chat.findById(chatId);

        if(!chat){
            res.status(404).json({
                message:"Chat not found",
            });
            return;
        }
        const isUserInChat = chat.users.some((userId)=> userId.toString() === userId.toString());
        if(!isUserInChat){
            res.status(403).json({
                message:"You are not a participant of this chat",
            });
            return;
        }

        const messagesToMarkSeen = await Messages.find({
            chatId:chatId,
            sender:{$ne:userId},
            seen:false,
        });

        await Messages.updateMany({
            chatId:chatId,
            sender:{$ne:userId},    
            seen:false,
        } ,{
            seen:true,
            seenAt: new Date(),
        });

        const messages = await Messages.find({chatId}).sort({createdAt:1});

        const otherUserId = chat.users.find((id) => id!== userId);

        try{
            const {data} = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);
            
            if(!otherUserId){
                res.status(403).json({
                    message:"No other user found in this chat",
                });
                return;
            }

            //socket work

            res.json({
                messages,
                user : data, 
            });
        }catch(error){
            console.log(error);
            res.json({
                messages,
                user : {_id:otherUserId, name:"Unknown User"},
            });

        }
    }
);