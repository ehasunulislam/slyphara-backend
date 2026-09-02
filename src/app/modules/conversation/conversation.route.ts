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
router.get(
    "/all-conversations", 
    auth(UserRole.Admin, UserRole.Developer, UserRole.Student),
    conversationController.getAllConversation
);


// search conversation
router.get("/search",
  auth(UserRole.Admin, UserRole.Developer, UserRole.Student),
  conversationController.searchConversation
);


// get conversation with id && login user
router.get("/:id", 
    auth(UserRole.Admin, UserRole.Developer, UserRole.Student),
    conversationController.getConversationById
);



export const conversationRouter = router;