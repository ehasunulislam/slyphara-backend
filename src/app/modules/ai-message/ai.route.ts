import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { aiController } from "./ai.conversation";

const router = Router();

// create the chat
router.post("/create-chat",
    auth(UserRole.Admin, UserRole.Developer, UserRole.Student),
    aiController.createChatAithAiIntoDB
)


export const aiRouter = router;