import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { adminController } from "./admin.conversation";

const router = Router();

// get all user route
 router.get(
    "/all-users", 
    auth(UserRole.Admin),
    adminController.getAllUser
);

// get payments analitics
 router.get(
    "/analytics", 
    auth(UserRole.Admin),
    adminController.getPaymentAnalytics
);


// get payments history
 router.get(
    "/payment-history", 
    auth(UserRole.Admin),
    adminController.getPaymentHistory
);

// Block the single user within update
 router.patch(
    "/blocked-user", 
    auth(UserRole.Admin),
    adminController.blockedUser
);

// unBlock the single user within update
 router.patch(
    "/unBlocked-user", 
    auth(UserRole.Admin),
    adminController.unBlockedUser
);

// get all conversation with message
router.get(
  "/conversations",
  auth(UserRole.Admin),
  adminController.getAllConversationForAdmin
);

export const adminRouter = router;