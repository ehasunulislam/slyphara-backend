import { Router } from "express";
import { auhtController } from "./auth.controller";
import { validatedSchema } from "../../middleware/validedUserSchema";
import { userValidation } from "./auth.validation";


const router = Router();

// create user
router.post("/register", validatedSchema(userValidation.registerUserZodSchema), auhtController.createUser);

// verificaiton user
// router.post("/verified-user", auhtController.veficationUser);

// Login user 
// router.post("/login", auhtController.loginUser);

// m-21 agai giving a new accesstoken route
// router.post("/refresh-token", auhtController.refreshToken);

// forgot password
// router.post("/forgot-password",  auhtController.forgotPassword); 

// reset password
// router.post("/reset-password", auhtController.resetPassword);


export const  authRouter = router;