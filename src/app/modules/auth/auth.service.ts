import { transporter } from "../../../lib/nodemailer";
import { prisma } from "../../../lib/prisma";
import { redisClient } from "../../../lib/redis";
import config from "../../config";
import { IRegisterUser, IVerifiedEmail } from "./auth.interface";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import path from "path";
import ejs from "ejs"
import { UserStatus } from "../../../generated/prisma/enums";
import { jwtUtils } from "../../utils/jwt";
import { SignOptions } from "jsonwebtoken";

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


// match the OTP and create the user
const verificationUser = async(payload: IVerifiedEmail) => {
    const otp = payload.otp;
    const email = payload.email.trim().toLocaleLowerCase();

    const isUserExist = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if(isUserExist?.status === "BLOCKED") {
        throw new Error("User already blocked");
    }

    if(isUserExist?.emailVerified) {
        throw new Error("User already verified with email");
    }

    /* otp matched with redis */
    const otpKey = `user-otp: ${email}`;
    const redisOTP = await redisClient.get(otpKey);

    if(!redisOTP) {
        throw new Error("OTP not found");
    }

    if(redisOTP !== otp) {
        throw new Error("OTP not matched");
    }

    await redisClient.del(otpKey);


    /* get the user data from redisDatabase */
    const userRegisterKey = `user-register-key: ${email}`;
    const registerData = await redisClient.get(userRegisterKey);

    if(!registerData) {
        throw new Error("User data not found")
    }

    const registerUserPayload : IRegisterUser = JSON.parse(registerData);

    /* create the user */
    const createdUser = await prisma.user.create({
        data: {
            name: registerUserPayload.name,
            email: registerUserPayload.email,
            password: registerUserPayload.password,
            profilePhoto: registerUserPayload.profilePhoto,
            role: registerUserPayload.role,
            status: UserStatus.ACTIVE,
            emailVerified: true,

            profile: {
                create: {}
            }
        },

        omit: { 
            password:  true
        },

        include: {
            profile: true
        }
    });


    /* delete the userdata from redis database  */
    await redisClient.del(userRegisterKey);


    /* sending a welcome message to email after created user */
    const templatePath = path.join(process.cwd(), "/src/app/template/welcome-message.ejs");
    const templateData = {
        name: createdUser.name
    };

    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
        from: config.email_sender,
        to: email,
        subject: "welcome message",
        html
    });


    /* convert the userData within the jwt token */
    const { profile, ...user } = createdUser;

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        user,
        accessToken, 
        refreshToken
    }
}



export const authService = {
    createUserIntoDB,
    verificationUser
}