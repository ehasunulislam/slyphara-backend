import { transporter } from "../../../lib/nodemailer";
import { prisma } from "../../../lib/prisma";
import { redisClient } from "../../../lib/redis";
import config from "../../config";
import { IRegisterUser } from "./auth.interface";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import path from "path";
import ejs from "ejs"

// register user and send the OTP in redis 
const createUserIntoDB = async(payload: IRegisterUser) => {
    const { name, email, password, profilePhoto, role } = payload;

    const isExistingUser = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if(isExistingUser) {
        throw new Error("User already exists");
    }


    const hashedPassword = await bcrypt.hash( password, Number(config.bcrypt_salt_rounds));

    /* redis processing */
    /* sending OTP */
    const expirationSecond = 60 * 5;
    const otpKey = `user-otp: ${email}`;
    const otpValue = crypto.randomInt(100000, 1000000).toString();

    await redisClient.set(otpKey, otpValue, {
        expiration: {
            type: "EX",
            value: expirationSecond
        }
    });

    /* sending user data in redis */
    const userRegisterKey = `user-register-key: ${email}`;
    const registerPayload = {
        name,
        email,
        password: hashedPassword,
        role
    }

    await redisClient.set(userRegisterKey, JSON.stringify(registerPayload), {
        expiration: {
            type: "EX",
            value: expirationSecond
        }
    });

    /* ejs processing */
    const templatePath = path.join(process.cwd(), "/src/app/template/send-otp.ejs");
    const templateData = {
        name, 
        email,
        otp: otpValue,
        password: hashedPassword,
        expirationLimit: expirationSecond / 60
    }

    const html = await ejs.renderFile(templatePath, templateData);

    /* node mailer processing */
    await transporter.sendMail({
        from: config.email_sender,
        to: email,
        subject: "Email Verification",
        html
    });
};



export const authService = {
    createUserIntoDB
}