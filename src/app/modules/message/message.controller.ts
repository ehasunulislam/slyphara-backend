import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { messageService } from "./message.service";

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


export const messageController = {
  createMessage,
//   getMessages
};