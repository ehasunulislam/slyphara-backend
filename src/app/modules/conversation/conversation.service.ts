import { prisma } from "../../../lib/prisma";
import { IConversation } from "./conversaiton.interface";

// create conversation
const createConversationIntoDB = async(payload: IConversation, userId: string) => {
    const { title } = payload;

    const createConversation = await prisma.conversation.create({
        data: {
            title,
            userId
        }
    });

    return createConversation
}

// get all conversation with login user
const getAllConversationFromDB = async(userId: string) => {
    const getConversation = await prisma.conversation.findMany({
        where: {
            userId
        }, 
        orderBy: {
            updatedAt: "desc"
        }
    });

    return getConversation
}


export const conversationService = {
  createConversationIntoDB,
  getAllConversationFromDB,
//   getConversationByIdFromDB,
//   searchConversationFromDB
};
