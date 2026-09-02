import { Router } from "express";
import { conversationController } from "./conversation.controller";
import { UserRole } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";

const router = Router();

// create conversation
router.post(
    "/create-conversation", 
    auth(UserRole.Admin, UserRole.Developer, UserRole.Student),
    conversationController.createConversation
);

// get conversation with login user
// router.get(
//     "/all-conversations", 
//     authMiddleware.auth(UserRole.Developer, UserRole.Student),
//     conversationController.getAllConversation
// );


// // get conversation with id && login user
// router.get(
//     "/:id", 
//     authMiddleware.auth(UserRole.Developer, UserRole.Student),
//     conversationController.getConversationById
// );

// // search conversation
// router.get(
//   "/search",
//   authMiddleware.auth(
//     UserRole.Developer,
//     UserRole.Student
//   ),
//   conversationController.searchConversation
// );


export const conversationRouter = router;