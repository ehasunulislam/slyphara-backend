import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { IForgotPasswordPayload } from "./auth.interface";



// register user and send the OTP in redis 
const createUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;

  await authService.createUserIntoDB(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Verification OTP send in your email",
    data: null,
  });
});

// match the OTP and create the user
const veficationUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;

  const result = await authService.verificationUser(payload);

  const { accessToken, refreshToken, user } = result;

  res.cookie("aToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.cookie("rToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "User registered successfully",
		data: {
			accessToken, 
      refreshToken, 
      user
		},
	});
});

// Login user functionality
const loginUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const { accessToken, refreshToken } = await authService.loginUserFromDB(payload);

    res.cookie("aToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24  // 1 day
    });

    res.cookie("rToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User loggedIn successfully",
      data: {
        accessToken, 
        refreshToken
      },
    })
});

// giving a new refresh token 
const refreshToken = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.rToken;

  const { accessToken } = await authService.refreshToken(refreshToken);

  res.cookie("my-token", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 10000 * 60 * 60 * 24
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Token Refresh successfully",
    data: {
      accessToken
    }
  })
});


// forgot password 
const forgotPassword = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;

  await authService.forgotPassword(payload);


  sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: `otp send at ${payload.email}`,
		data: null,
	});
});






export const auhtController = {
    createUser,
    veficationUser,
    loginUser,
    refreshToken,
    forgotPassword
}
