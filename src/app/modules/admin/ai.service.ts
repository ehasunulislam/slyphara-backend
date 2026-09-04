import { PaymentStatus, SubscriptionPlan } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { IPaymentHistory } from "./ai.interface";


// get all user
const getAllUserFromDB = async() => {
    const getAllUser = await prisma.user.findMany({
        omit: {
            password: true
        }
    });

    return getAllUser
};


// get payments analitics
const getPaymentAnalytics = async() => {
    const totalPayments = await prisma.subscription.count();
    const successfulPayments = await prisma.subscription.count({
        where: {
            status: "PAID"
        }
    });

    const cancelPayments = await prisma.subscription.count({
        where: {
            status: "FAILED"
        }
    });

    const pendingPayments = await prisma.subscription.count({
        where: {
            status: "PENDING"
        }
    });

    const revenue = await prisma.subscription.aggregate({
        _sum: {
            amount: true
        },
        where: {
            status: "PAID"
        }
    });

    return {
        totalPayments,
        successfulPayments,
        cancelPayments,
        pendingPayments,
        totalRevenue: revenue._sum.amount || 0
    }
}


// get all payment history
const getPaymentHistory = async(payload: IPaymentHistory) => {
    const { email, paymentStatus, stripeSessionId, stripePaymentId, subscriptionPlan} = payload;

    const payments = await prisma.subscription.findMany({
        where: {
            ...(paymentStatus && {
                status: paymentStatus as PaymentStatus
            }),

            ...(stripeSessionId && {
                stripeSessionId: {
                contains: stripeSessionId,
                mode: "insensitive",
                },
            }),

            ...(stripePaymentId && {
                stripePaymentId: {
                contains: stripePaymentId,
                mode: "insensitive",
                },
            }),

            ...(subscriptionPlan && {
                plan: subscriptionPlan as SubscriptionPlan,
            }),

            ...(email && {
                user: {
                email: {
                    contains: email,
                    mode: "insensitive",
                },
                },
            }),
        }, 

        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    subscriptionPlan: true,
                    subscriptionStart: true,
                    subscriptionEnd: true
                }
            }
        },

        orderBy: {
            createdAt: "desc"
        }
    });

    return payments
}


export const adminService = {
    getAllUserFromDB,
    getPaymentAnalytics,
    getPaymentHistory
}