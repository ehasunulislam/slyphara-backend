import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./subscription.service";


// create checkout session with stripe
const createCheckoutSession  = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id as string;

  const result = await paymentService.createCheckoutSession(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Stripe checkout session created successfully",
    data: result,
  });
});

// Verify Payment functionality
const verifyPayment  = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id as string;
  const { sessionId } = req.body;

  if(!sessionId) {
    return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Session ID is required",
    })
  }

  const result = await paymentService.verifyPayment({sessionId, userId});

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Stripe checkout session created successfully",
    data: result,
  });
});


export const paymentController = {
  createCheckoutSession,
  verifyPayment,
};