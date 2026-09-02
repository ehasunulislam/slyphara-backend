import { MessageRole } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { IMessageCreate } from "./message.interface";
import httpStatus from "http-status";


// create message 
const createMessageInToDB = async(payload: IMessageCreate) => {
    const { conversationId, content } = payload;

    if(!conversationId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Conversation Id Not Found")
    }

    const message = await prisma.message.create({
        data: {
            conversationId,
            content,
            role: MessageRole.USER
        }
    });

    return message
}


// get message By Conversation Id && login user
const getMessageById = async(conversationId: string, userId: string) => {
    const findConversation = await prisma.conversation.findUnique({
        where: {
            id: conversationId
        }
    });

    if(!findConversation) {
        throw new AppError(httpStatus.NOT_FOUND, "Conversation not found");
    }

    if(findConversation.userId !== userId) {
        throw new AppError(httpStatus.NOT_FOUND, "Unauthorized user");
    }

    const message = await prisma.message.findMany({
        where: {
            conversationId
        },
        orderBy: {
            createdAt: "asc"
        }
    });

    return message
}


export const messageService = {
  createMessageInToDB,
  getMessageById
};