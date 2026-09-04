import express from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { paymentController } from "./subscription.controller";

const router = express.Router();


// Create Stripe checkout
router.post(
  "/create-checkout-session",
  auth(UserRole.Developer, UserRole.Student),
  paymentController.createCheckoutSession
);


// Verify Stripe payment
router.post(
  "/verify-payment",
  auth(UserRole.Developer, UserRole.Student),
  paymentController.verifyPayment
);


export const subscriptionRouter = router;