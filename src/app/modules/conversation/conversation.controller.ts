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


// search conversation
const searchConversation  = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const search = req.query.search as string;

    const userId = req.user?.id as string;

    const conversations = await conversationService.searchConversationFromDB(search, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Conversations searched successfully",
        data: {
            conversations,
        },
    });
})


export const conversationController = {
    createConversation,
    getAllConversation,
    searchConversation
    // getConversationById,
}