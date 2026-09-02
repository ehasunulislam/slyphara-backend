import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { messageService } from "./message.service";

// create message 
const createMessage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const messageCreated = await messageService.createMessageInToDB(payload);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Message created successfully",
      data: {
        messageCreated
      },
    });
  }
);


// get message By Conversation Id && login user
const getMessages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const conversationId  = req.params.conversationId as string;
    const userId = req.user?.id as string;

    const messages = await messageService.getMessageById(
      conversationId,
      userId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Messages retrieved successfully",
      data: {
        messages
      },
    });
});


export const messageController = {
  createMessage,
  getMessages
};