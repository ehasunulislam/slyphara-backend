import { UserRole } from "../../../generated/prisma/enums";

export interface IRegisterUser {
    name: string;
    email: string;
    password: string;
    profilePhoto?: string;
    role: UserRole;
    status: "ACTIVE" | "BLOCKED";
}

export interface IVerifiedEmail {
    email: string;
    otp: string;
}

export interface ILoginUser  {
    email: string,
    password: string
}


export interface IForgotPasswordPayload {
	email: string;
}


export interface IResetPasswordPayload {
	email: string;
	otp: string;
	newPassword: string;
}