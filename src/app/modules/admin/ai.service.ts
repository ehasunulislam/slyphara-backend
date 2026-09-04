import { prisma } from "../../../lib/prisma";

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


export const adminService = {
    getAllUserFromDB,
    getPaymentAnalytics
}