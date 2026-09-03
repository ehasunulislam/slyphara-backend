import { MessageRole } from "../../../generated/prisma/enums";
import { openRouter } from "../../../lib/openRouter";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { IChat } from "./ai.interface";
import httpStatus from "http-status";

// create the chat with AI into DB
const createChatWithAiIntoDB = async(payload: IChat, userId: string) => {
    const {conversationId, message} = payload;

    const conversation = await prisma.conversation.findUnique({
        where: {
            id: conversationId
        }
    });

    if (!conversation) {
        throw new AppError(httpStatus.NOT_FOUND, "Conversation not found");
    }

    if (conversation.userId !== userId) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    /* save the user's message */
    const userMessage = await prisma.message.create({
        data: {
            conversationId,
            content: message,
            role: MessageRole.USER
        }
    });

    /* Get all messages of this conversation */
    const messages = await prisma.message.findMany({
        where: {
            conversationId
        },
        orderBy: {
            createdAt: "asc"
        }
    });

    
    /* open router functionality */
    const formateMessages = messages.map((msg) => ({
        role: 
        msg.role === MessageRole.USER ?
            ("user" as const) :
            ("assistant" as const),
        content: msg.content
    }));

    let apiResponseText = "";

    try {
        const response = await openRouter.chat.completions.create({
            model: "deepseek/deepseek-chat-v3",
            messages: formateMessages
        });

        apiResponseText = response.choices[0].message?.content || "No response generate"
    }
    catch(err) {
        console.error("OpenRouter Error:", err);
        apiResponseText = "AI service is temporarily unavailable.";
    }

    const assistantMessage = await prisma.message.create({
        data: {
            conversationId,
            content: apiResponseText,
            role: MessageRole.ASSISTANT
        }
    });

    return {
        conversationId,
        userMessage,
        assistantMessage,
        historyCount: messages.length
    }
}

export const aiService = {
  createChatWithAiIntoDB,
};