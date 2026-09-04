import { transporter } from "../../lib/nodemailer";
import config from "../config";
import { ISendSubscriptionConfirmationPdf } from "../modules/subscription/subscription.interface";
import PDFDocument from "pdfkit";


export const sendSubscriptionConfirmationPdf = async(payload: ISendSubscriptionConfirmationPdf) => {

    const {email, name, startDate, endDate} = payload

    const pdf = new PDFDocument({
        margin: 50
    });

    const chunks: Buffer[] = [];

    pdf.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
    });

    const pdfPromise = new Promise<Buffer>((resolve) => {
        pdf.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
    });

    pdf.rect(0, 0, pdf.page.width, 90).fill("#0F172A");

    pdf
    .fillColor("#FFFFFF")
    .fontSize(24)
    .text("SYLPHARA AI", 50, 25, {
        align: "center",
    });

    pdf
    .fontSize(12)
    .text("Premium Subscription Confirmation", {
        align: "center",
    });

    pdf.moveDown(4);

    pdf.fillColor("#000000");

    pdf
    .fontSize(18)
    .text("Subscription Receipt", {
        underline: true,
    });

    pdf.moveDown();

    pdf.fontSize(12);

    pdf.text(`Subscriber Name: ${name}`);
    pdf.text(`Email Address: ${email}`);
    pdf.text(`Plan: HALF YEARLY`);
    pdf.text(`Amount Paid: $150 USD`);
    pdf.text(`Daily Chat Limit: 100 Messages`);

    pdf.moveDown();

    pdf.text(
    `Subscription Start Date: ${startDate.toDateString()}`
    );

    pdf.text(
    `Subscription End Date: ${endDate.toDateString()}`
    );

    pdf.moveDown(2);

    pdf
    .fontSize(14)
    .text("Included Benefits", {
        underline: true,
    });

    pdf.moveDown(0.5);

    pdf.fontSize(12);

    pdf.text("• Access to Sylphara AI Premium");
    pdf.text("• Up to 100 AI conversations per day");
    pdf.text("• Priority response performance");
    pdf.text("• 6 Months Premium Membership");

    pdf.moveDown(2);

    pdf
    .fontSize(14)
    .text("Payment Status", {
        underline: true,
    });

    pdf.moveDown(0.5);

    pdf
    .fillColor("green")
    .fontSize(14)
    .text("PAID ✓");

    pdf.fillColor("black");

    pdf.moveDown(2);

    pdf
    .fontSize(12)
    .text(
        "Thank you for subscribing to Sylphara AI. Your premium membership has been activated successfully.",
        {
        align: "justify",
        }
    );

    pdf.moveDown(3);

    pdf
    .fontSize(10)
    .fillColor("gray")
    .text(
        "This document serves as your official subscription confirmation receipt.",
        {
        align: "center",
        }
    );

    pdf.text(
    "© Sylphara AI. All Rights Reserved.",
    {
        align: "center",
    }
    );

  pdf.end();

  const pdfBuffer = await pdfPromise;


  await transporter.sendMail({
    from: config.email_sender,
    to: email,
    subject: "Premium Subscription Activated",

    text: `
      Your payment was successful.
      Premium subscription is now active.
    `,

    attachments: [
      {
        filename: "subscription-confirmation.pdf",
        content: pdfBuffer,
      },
    ],
  })
}