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


export const messageService = {
  createMessageInToDB,
//   getMessagesFromDB,
};