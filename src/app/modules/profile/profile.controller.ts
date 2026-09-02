import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { profileService } from "./profile.service";
import { sendResponse } from "../../utils/sendResponse";

// get Profile withing login user
const getProfile = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    const profile = await profileService.getProfileFormDB(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
});


// update profile within login user
const updateProfile = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string; 
    const payload = req.body

    const profile = await profileService.updatedProfileFormDB(userId, payload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
});

export const profileController = {
    getProfile,
    updateProfile
}