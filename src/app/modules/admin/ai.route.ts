import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { adminController } from "./ai.conversation";

const router = Router();

// get all user route
 router.get(
    "/all-users", 
    auth(UserRole.Admin),
    adminController.getAllUser
)

export const adminRouter = router;