import { catchAsync } from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { conversationService } from "./conversation.service";


// create conversation
const createConversation = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const id = req.user?.id as string;

    const createdConversation = await conversationService.createConversationIntoDB(payload, id);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Conversation created successfully",
        data: {
            createdConversation
        },
    });
});


// get all conversation with login user
const getAllConversation  = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    const getConversations = await conversationService.getAllConversationFromDB(
        userId
    );

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Conversations retrieved successfully",
        data: {
            getConversations
        },
    });
});


export const conversationController = {
    createConversation,
    getAllConversation,
    // getConversationById,
    // searchConversation
}