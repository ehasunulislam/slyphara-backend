import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";


// register user and send the OTP in redis 
const createUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;

  await authService.createUserIntoDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Verification OTP send in your email",
    data: null,
  });
});


export const auhtController = {
    createUser
}
