import { subMonths } from "date-fns";
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

// get all conversation with message
const getAllConversationForAdmin = async () => {
  const messages = await prisma.message.findMany({
    include: {
      conversation: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "asc",
    },
  });

  return messages;
};


// get developer analytics
const getDeveloperAnalytics = async () => {
  const threeMonthsAgo = subMonths(new Date(), 3);

  const analytics = await prisma.messageUsage.groupBy({
    by: ["userId"],

    where: {
      createdAt: {
        gte: threeMonthsAgo,
      },

      user: {
        role: UserRole.Developer,
      },
    },

    _sum: {
      count: true,
    },

    orderBy: {
      _sum: {
        count: "desc",
      },
    },
  });

  const developers = await Promise.all(
    analytics.map(async (item) => {
      const user = await prisma.user.findUnique({
        where: {
          id: item.userId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          projectAccess: true,
        },
      });

      return {
        ...user,
        totalMessages: item._sum.count || 0,
      };
    })
  );

  return {
    totalDevelopers: developers.length,
    topDeveloper: developers[0] || null,
    developers,
  };
};

// Give Project Access - Developer
const grantProjectAccess = async(email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email.toLocaleLowerCase().trim()
        }
    });

    if(!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if(user.role !== UserRole.Developer) {
        throw new AppError(httpStatus.BAD_REQUEST, "Only developer can get project access");
    }

    const updatedUser = await prisma.user.update({
        where: {
            email: user.email
        }, 

        data: {
            projectAccess: true
        },

        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            projectAccess: true
        }
    });

    return updatedUser
}

// Remove Project Access - Developer
const removeProjectAccess = async(email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email.toLocaleLowerCase().trim()
        }
    });

    if(!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const updatedUser = await prisma.user.update({
        where: {
            email: user.email
        },

        data: {
            projectAccess: false
        },

        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            projectAccess: true
        }
    });

    return updatedUser;
}

// Get All Project Developers
const getProjectDevelopers = async() => {

    const developers = await prisma.user.findMany({
        where: {
            role: UserRole.Developer,
            projectAccess: true
        },

        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            projectAccess: true,
            createdAt: true
        },

        orderBy: {
            createdAt: "desc"
        }
    });

    return developers;
};


export const adminService = {
    getAllUserFromDB,
    getPaymentAnalytics,
    getPaymentHistory,
    blockedUser,
    unBlockedUser,
    getAllConversationForAdmin,
    getDeveloperAnalytics,
    grantProjectAccess,
    removeProjectAccess,
    getProjectDevelopers
}