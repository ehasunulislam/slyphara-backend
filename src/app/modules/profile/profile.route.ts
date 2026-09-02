import { Router } from "express";
import { profileController } from "./profile.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";


const router = Router();

// get Profile form DB withing login user
router.get("/me", 
    auth(UserRole.Admin, UserRole.Student, UserRole.Developer),  
    profileController.getProfile
);

// update profile within login user
// router.patch("/me", 
//     auth(UserRole.Admin, UserRole.Student, UserRole.Developer),  
//     profileController.updateProfile
// );


export const profileRouter = router;