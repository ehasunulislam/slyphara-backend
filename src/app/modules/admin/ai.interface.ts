export interface IPaymentHistory {
    email: string,
    paymentStatus: string,
    stripeSessionId: string,
    stripePaymentId: string,
    subscriptionPlan: string
}