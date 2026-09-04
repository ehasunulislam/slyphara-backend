export interface IVerifiePayment {
    sessionId: string,
    userId: string
} 

export interface ISendSubscriptionConfirmationPdf {
    email: string,
    name: string,
    startDate: Date,
    endDate: Date
}