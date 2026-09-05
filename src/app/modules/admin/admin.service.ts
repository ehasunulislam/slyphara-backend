import { PaymentStatus, SubscriptionPlan, UserRole, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { IPaymentHistory, IUserStatusUpdate } from "./admin.interface";
import httpStatus from "http-status"


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


// Block the single user within update
const blockedUser = async(payload: IUserStatusUpdate) => {
    const { email } = payload;

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if(!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    if(user.role === UserRole.Admin) {
        throw new AppError(httpStatus.BAD_REQUEST, "Admin account cannot be blocked")
    }

    if(user.status === "BLOCKED"){
        throw new AppError(httpStatus.BAD_REQUEST, "User already blocked")
    }

    const blockedUser = await prisma.user.update({
        where: {
            email
        }, 

        data: {
            status: UserStatus.BLOCKED
        }
    });

    return blockedUser
}

// Un-Block the single user within update
const unBlockedUser = async(payload: IUserStatusUpdate) => {
    const { email } = payload;

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if(!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    if(user.status === "ACTIVE"){
        throw new AppError(httpStatus.BAD_REQUEST, "User already Active")
    }

    const unBlockedUser = await prisma.user.update({
        where: {
            email
        }, 

        data: {
            status: UserStatus.ACTIVE
        }
    });

    return unBlockedUser
}


export const adminService = {
    getAllUserFromDB,
    getPaymentAnalytics,
    getPaymentHistory,
    blockedUser,
    unBlockedUser
}