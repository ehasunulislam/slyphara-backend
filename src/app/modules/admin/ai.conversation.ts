import { catchAsync } from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { adminService } from "./ai.service";
import { sendResponse } from "../../utils/sendResponse";


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


export const adminController = {
    getAllUser
}