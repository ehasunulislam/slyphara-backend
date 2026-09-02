import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { messageController } from "./message.controller";


const router = Router();

// create message 
router.post(
  "/create-message",
  auth(UserRole.Admin, UserRole.Developer, UserRole.Student),
  messageController.createMessage
);

// get message By Conversation Id && login user
// router.get(
//     "/:conversationId",
//     auth(UserRole.Developer, UserRole.Student),
//     messageController.getMessages
// );

export const messageRouter = router;