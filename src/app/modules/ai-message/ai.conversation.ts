import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { aiService } from "./ai.service";
import { sendResponse } from "../../utils/sendResponse";

// create the chat with AI into DB
const createChatAithAiIntoDB = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    const chat = await aiService.createChatWithAiIntoDB(
      req.body,
      userId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "AI response generated successfully",
      data: {
        chat
      },
    });
});


export const aiController = {
  createChatAithAiIntoDB,
};