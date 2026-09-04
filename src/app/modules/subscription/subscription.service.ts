import { PaymentStatus, SubscriptionPlan } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { stripe } from "../../../lib/stripe";
import config from "../../config";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status"
import { IVerifiePayment } from "./subscription.interface";
import { sendSubscriptionConfirmationPdf } from "../../service/subscriptionPDF";


// create checkout session with stripe
const createCheckoutSession = async(userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND,"User not found");
    }


    /* check the existing active subscriptoin */
    if(
        user.subscriptionPlan === SubscriptionPlan.HALF_YEARLY &&
        user.subscriptionEnd &&
        user.subscriptionEnd > new Date()
    ) {
        throw new AppError(httpStatus.BAD_REQUEST,"You already have an active subscription");
    }

    /* create the Checkout Session */
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Premimum AI - 6 Months",
                        description: "Premium AI access with 100 chats per day for 6 months"
                    },
                    // 150$
                    unit_amount: Math.round(Number(150) * 100)
                },
                quantity: 1
            }
        ],

        customer_email: user.email,
        metadata: {
            userId: user.id,
            plan: SubscriptionPlan.HALF_YEARLY
        },

        success_url: `${config.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.frontend_url}/payment/cancel`,
    });


    /* save the PENDING payment  */
    await prisma.subscription.create({
        data: {
            userId: user.id,
            amount: 150,
            plan: SubscriptionPlan.HALF_YEARLY,
            status: PaymentStatus.PENDING,
            stripeSessionId: session.id,
            currency: "usd"
        }
    });

    return {
        checkoutUrl: session.url,
        sessionId: session.id,
    }
}

// Verify Payment functionality
const verifyPayment = async(payload: IVerifiePayment) => {
    const {sessionId, userId} = payload;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    /* check payment status */
    if(session.payment_status !== "paid") {
        /* update payment as failed */
        await prisma.subscription.updateMany({
            where: {
                stripeSessionId: session.id,
                userId
            },

            data: {
                status: PaymentStatus.FAILED
            }
        });

        throw new AppError(httpStatus.BAD_REQUEST, "Payment is not completed");
    }

    /* check the meta data */
    if(session.metadata?.userId !== userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized payment");
    }


    /* find the subscription */
    const subscription = await prisma.subscription.findUnique({
        where: {
            stripeSessionId: session.id
        }
    });

    if (!subscription) {
        throw new AppError(httpStatus.NOT_FOUND, "Subscription record not found");
    }

    /* stope the duplicate verification */
    if(subscription.status === PaymentStatus.PAID) {
        const currentUser = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        return {
            message: "Payment already verified",
            SubscriptionPlan: currentUser?.subscriptionPlan,
            SubscriptionStart: currentUser?.subscriptionStart,
            SubscriptionEnd: currentUser?.subscriptionEnd,
        }
    }


    /* Track the paymentId */
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : null

    /* subscription date */
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(
        endDate.getMonth() + 6
    );

    /* update the DB */
    await prisma.$transaction(async(tx) => {
        /* update the subscription */
        await tx.subscription.update({
            where: {
                id: subscription.id
            },

            data: {
                status: PaymentStatus.PAID,
                stripePaymentId: paymentIntentId
            }
        });

        /* update the user */
        await tx.user.update({
            where: {
                id: userId
            },

            data: {
                subscriptionPlan: SubscriptionPlan.HALF_YEARLY,
                isPremimum: true,
                subscriptionStart: startDate,
                subscriptionEnd: endDate
            }
        })
    });


    const currentUser = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if(currentUser) {
        await sendSubscriptionConfirmationPdf({
            email: currentUser.email,
            name: currentUser.name,
            startDate,
            endDate,
        })
    }


    return {
        message: "Payment verified successfully",
        subscriptionPlan: SubscriptionPlan.HALF_YEARLY,
        amount: 150,
        currency: "usd",
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
    }
}



export const paymentService = {
  createCheckoutSession,
  verifyPayment,
};