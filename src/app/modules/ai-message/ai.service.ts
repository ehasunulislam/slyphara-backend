import { endOfDay, startOfDay } from "date-fns";
import { MessageRole, SubscriptionPlan, UserRole } from "../../../generated/prisma/enums";
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
        throw new AppError(httpStatus.NOT_FOUND, "Unauthorized");
    }

    /* find the user */
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const isAdmin = user.role === UserRole.Admin;
    const isPremimumActive = user.subscriptionPlan === SubscriptionPlan.HALF_YEARLY &&
                             user.subscriptionEnd !== null &&
                             user.subscriptionEnd > new Date();

    const dailyLimit = isAdmin ? null : isPremimumActive ? 100 : 20

    /* free user limit check */
    // if(user.role !== UserRole.Admin && user.subscriptionPlan === SubscriptionPlan.FREE) {
    //     const usage = await prisma.messageUsage.findFirst({
    //         where: {
    //             userId,
    //             createdAt: {
    //                 gte: startOfDay(new Date()),
    //                 lte: endOfDay(new Date()),
    //             }
    //         }
    //     });

    //     if (usage && usage.count >= 20) {
    //         throw new AppError(httpStatus.FORBIDDEN,"Daily chat limit exceeded. Upgrade your plan.");
    //     }
    // }

    if(dailyLimit) {
        const usage = await prisma.messageUsage.findFirst({
            where: {
                userId, 
                createdAt: {
                    gte: startOfDay(new Date()),
                    lte: endOfDay(new Date()),
                }
            }
        });

        if(usage && usage.count >= dailyLimit) {
            throw new AppError(httpStatus.FORBIDDEN,  `Daily chat limit exceeded. Your limit is ${dailyLimit} chats per day.`)
        }
    }


    /* save the user's message */
    const userMessage = await prisma.message.create({
        data: {
            conversationId,
            content: message,
            role: MessageRole.USER
        }
    });

    /* GET CONVERSATION HISTORY */
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

    /* update the daily message */
    // if(user.role !== UserRole.Admin && user.subscriptionPlan === SubscriptionPlan.FREE) {
    //     const usage = await prisma.messageUsage.findFirst({
    //         where: {
    //             userId,
    //             createdAt: {
    //                 gte: startOfDay(new Date()),
    //                 lte: endOfDay(new Date()),
    //             }
    //         }
    //     });

    //     if(!usage) {
    //         await prisma.messageUsage.create({
    //             data: {
    //                 userId, 
    //                 count: 1,
    //                 date: new Date()
    //             }
    //         });
    //     } else {
    //         await prisma.messageUsage.update({
    //             where: {
    //                 id: usage.id
    //             },

    //             data: {
    //                 count: {
    //                     increment: 1
    //                 }
    //             }
    //         })
    //     }
    // }
    if (dailyLimit !== null) {
        const usage = await prisma.messageUsage.findFirst({
            where: {
                userId, 
                createdAt: {
                    gte: startOfDay(new Date()),
                    lte: endOfDay(new Date()),
                }
            }
        });

        if(!usage) {
            await prisma.messageUsage.create({
                data: {
                    userId, 
                    count: 1,
                    date: new Date()
                }
            });
        } else {
            await prisma.messageUsage.update({
                where: {
                    id: usage.id
                },

                data: {
                    count: {
                        increment: 1
                    }
                }
            })
        }
    }

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