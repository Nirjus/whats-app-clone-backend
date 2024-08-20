import createError from "http-errors";
import { db } from "../utils/PrismaClient.js";
import {renameSync} from "fs";
export const addMessage = async (
  req,
  res,
  next
) => {
  try {
    const { message, from, to } = req.body;

    const getUser =  onlineUsers.get(to)

    if (message && from && to ) {
      const newMessage = await db.messages.create({
        data: {
          message,
          sender: { connect: { id: from } },
          receiver: { connect: { id: to } },
          messageStatus: getUser ? "delivered" : "sent",
        },
        include: {
          sender: true,
          receiver: true,
        },
      });
      return res.status(201).json({
        status: true,
        newMessage,
      });
    }

    return res.status(400).send("From, to and Message is required");
  } catch (error) {
    next(createError(500, error));
  }
};

export const addImageMessage = async (req, res, next) => {
   try {
    const image = req.file;
    if(image){
      let fileName = "uploads/images/" + Date.now() + image.originalname;
      renameSync(image.path, fileName);
  
      const {from, to} = req.query;

      if(from && to){
        const message = await db.messages.create({
          data:{
             message: fileName,
             sender: {connect: {id: from}},
             receiver: {connect: {id: to}},
             type: "image"
          }
        })

        return res.status(201).json({
          status: true,
          message
        })
      }else{
        return res.status(400).send("From and to is required");
      }
    }
    return res.status(400).send("Image is required")
   } catch (error) {
      next(createError(500, error))
   }
}

export const addAudioMessage = async (req, res, next) => {
  try {
    const audio = req.file
    if(audio){
      let filename = "uploads/recordings/"+ Date.now() + audio.originalname;
      renameSync(audio.path, filename);
      const {from, to} = req.query;
  
      if(from && to){
        const message = await db.messages.create({
          data:{
            message: filename,
            sender: {connect: {id: from}},
            receiver: {connect: {id: to}},
            type: "audio"
          }
        });
  
        return res.status(201).json({
          status: true,
          message
        })
      }
      return res.status(400).send("From and to is required");
    }
    return res.status(400).send("Audio is required")
    
  } catch (error) {
    next(createError(500, error))
  }
}

export const addVideoMessage = async (req, res, next) => {
  try {
      const video = req.file;
      if(video){
        const fileName = "uploads/videos/"+ Date.now() + video.originalname;
        renameSync(video.path, fileName);

        const {from, to} = req.query;

        if(from && to){
          const message = await db.messages.create({
            data:{
              message: fileName,
              sender: {connect: {id: from}},
              receiver: {connect: {id: to}},
              type: "video"
            }
          });

          return res.status(201).json({
            status: true,
            message
          })
        }else{
          return res.status(400).send("From and To is required")
        }
      }
      return res.status(400).send("Video is required")
  } catch (error) {
      next(createError(500, error))
  }
}

export const getMessages = async (
  req,
  res,
  next
) => {
  try {
    const { from, to } = req.params;

    const messages = await db.messages.findMany({
      where: {
        OR: [
          {
            senderId: from,
            receiverId: to,
          },
          {
            senderId: to,
            receiverId: from,
          },
        ],
      },
      orderBy: {
        id: "asc",
      },
    });
    const unreadMessages = [];
    messages.forEach((message, index) => {
      if (message.messageStatus !== "read" && message.senderId === to) {
        messages[index].messageStatus = "read";
        unreadMessages.push(message.id);
      }
    });

    await db.messages.updateMany({
      where: {
        id: { in: unreadMessages },
      },
      data: {
        messageStatus: "read",
      },
    });
    return res.status(201).json({
      status: true,
      messages,
    });
  } catch (error) {
    next(createError(500, error));
  }
};

export const getInititalContactsWithMessages = async (req, res, next) => {

  try {
      const userId = req.params.from;

      const user = await db.user.findUnique({
        where: {id: userId},
        include:{
         sentMessages:{
          include:{
            receiver: true,
            sender: true,
          },
          orderBy:{
            createdAt:"desc",
          },
         },
         receivedMessages:{
          include:{
            receiver: true,
            sender: true,
          },
          orderBy:{
            createdAt:"desc",
          },
         },
        }
      })
      const messages = [...user.sentMessages, ...user.receivedMessages];
      messages.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
      const users = new Map();
      const messagesStatusChange = [];

      messages.forEach((msg) => {
        const isSender = msg.senderId === userId;
        const calculatedId = isSender ? msg.receiverId : msg.senderId;

        if(msg.messageStatus === "sent"){
          messagesStatusChange.push(msg.id)
        }
        const {id, type, message, messageStatus, createdAt, senderId, receiverId} = msg;
        if(!users.get(calculatedId)){
         
          let user = {messageId:id, type, message, messageStatus, createdAt, senderId, receiverId};
          if(isSender){
            user = {
              ...user, ...msg.receiver, totalUnreadMessages:0,
            };
          }else{
            user = {
              ...user, ...msg.sender, totalUnreadMessages: messageStatus !== "read" ? 1 : 0
            }
          }
           users.set(calculatedId, {...user})
        }else if(messageStatus !== "read" && !isSender){
        const user = users.get(calculatedId);
        users.set(calculatedId,{
          ...user,
          totalUnreadMessages: user.totalUnreadMessages + 1
        })
        }
      });

      if(messagesStatusChange.length){
        await db.messages.updateMany({
          where: {
            id: { in: messagesStatusChange },
          },
          data: {
            messageStatus: "delivered",
          },
        });
      }

      return res.status(201).json({
        users: Array.from(users.values()),
        onlineUsers: Array.from(onlineUsers.keys()),
      })
  } catch (error) {
    next(createError(500, error))
  }
}