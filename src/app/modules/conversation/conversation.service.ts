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

// search conversation
const searchConversationFromDB = async(search: string, userId: string) => {
    const conversation = await prisma.conversation.findMany({
        where: {
            userId,

            title: {
                contains: search,
                mode: "insensitive"
            }
        },

        orderBy: {
            updatedAt: "desc"
        }
    });

    return conversation
}

// get conversation with id && login user`  
const getConversationByIdFromDB = async(userId: string, id: string) => {
    const getConversationWithId = await prisma.conversation.findUnique({
        where: {
            userId, id
        }
    });

    return getConversationWithId
}


export const conversationService = {
  createConversationIntoDB,
  getAllConversationFromDB,
  searchConversationFromDB,
  getConversationByIdFromDB
};
