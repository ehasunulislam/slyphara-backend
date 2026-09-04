import { catchAsync } from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { adminService } from "./ai.service";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentStatus, SubscriptionPlan } from "../../../generated/prisma/enums";


// get all user
const getAllUser = catchAsync(async(req: Request, res: Response, next: NextFunction) =>{
    const users = await adminService.getAllUserFromDB();

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Bookings retrieved successfully",
        data: {
            users
        },
    });
});

// get payments analitics
const getPaymentAnalytics = catchAsync(async(req: Request, res: Response, next: NextFunction) =>{
    const analytics = await adminService.getPaymentAnalytics();

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Bookings retrieved successfully",
        data: analytics,
    });
});


// get all payment history
const getPaymentHistory = catchAsync(async(req: Request, res: Response, next: NextFunction) =>{
    const email = req.query.email as string;
    const paymentStatus = req.query.paymentStatus as PaymentStatus;
    const stripeSessionId = req.query.stripeSessionId as string;
    const stripePaymentId = req.query.stripePaymentId as string;
    const subscriptionPlan = req.query.subscriptionPlan as SubscriptionPlan

    const paymentHistory = await adminService.getPaymentHistory({email, paymentStatus, stripeSessionId, stripePaymentId, subscriptionPlan});

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Bookings retrieved successfully",
        data: paymentHistory,
    });
});


export const adminController = {
    getAllUser,
    getPaymentAnalytics,
    getPaymentHistory
}