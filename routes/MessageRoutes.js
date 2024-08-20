import { Router } from "express";
import {
  addAudioMessage,
  addImageMessage,
  addMessage,
  addVideoMessage,
  getInititalContactsWithMessages,
  getMessages,
} from "../controller/MessageController.js";
import multer from "multer";

const messageRouter = Router();

const uploadAudio = multer({ dest: "../server/uploads/recordings" });
const uploadImage = multer({ dest: "../server/uploads/images" });
const uploadVideo = multer({ dest: "../server/uploads/videos" });

messageRouter.post("/add-message", addMessage);
messageRouter.get("/get-messages/:from/:to", getMessages);
messageRouter.post("/add-audio", uploadAudio.single("audio"), addAudioMessage);
messageRouter.post("/add-image", uploadImage.single("image"), addImageMessage);
messageRouter.post("/add-video", uploadVideo.single("video"), addVideoMessage);
messageRouter.get(
  "/get-initial-contacts/:from",
  getInititalContactsWithMessages
);

export default messageRouter;
