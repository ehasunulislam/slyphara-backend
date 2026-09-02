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


export const conversationService = {
  createConversationIntoDB,
//   getAllConversationFromDB,
//   getConversationByIdFromDB,
//   searchConversationFromDB
};
