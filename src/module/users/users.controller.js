import { Router } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { successResponse } from "../../common/utils/response.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { uploadImage, buildImageUrl } from "../../common/middleware/multer.js";
import { BadRequestException } from "../../common/utils/apiError.js";
import {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  refreshTokenSchema,
  googleLoginSchema,
} from "./users.validation.js";
import * as usersService from "./users.service.js";

const router = Router();

router.post(
  "/signup",
  uploadImage,
  validate(signupSchema),
  asyncHandler(async (req, res) => {
    const profileImage = req.file
      ? buildImageUrl(req, req.file.filename)
      : null;

    const result = await usersService.signup({
      ...req.body,
      profileImage,
    });

    successResponse(res, { statusCode: 201, ...result });
  }),
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await usersService.login(req.body);
    successResponse(res, result);
  }),
);

router.post(
  "/verify-otp",
  validate(verifyOtpSchema),
  asyncHandler(async (req, res) => {
    const result = await usersService.verifyOtp(req.body);
    successResponse(res, result);
  }),
);

router.post(
  "/resend-otp",
  validate(resendOtpSchema),
  asyncHandler(async (req, res) => {
    const result = await usersService.resendOtp(req.body);
    successResponse(res, result);
  }),
);

router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  asyncHandler(async (req, res) => {
    const result = await usersService.refreshToken(req.body);
    successResponse(res, result);
  }),
);

router.post(
  "/google-login",
  validate(googleLoginSchema),
  asyncHandler(async (req, res) => {
    const result = await usersService.googleLogin(req.body);
    successResponse(res, result);
  }),
);

router.get(
  "/profile",
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await usersService.getProfile(req.user.id);
    successResponse(res, result);
  }),
);

router.post(
  "/upload-image",
  authenticate,
  uploadImage,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new BadRequestException("Image file is required");
    }

    const imageUrl = buildImageUrl(req, req.file.filename);
    const result = await usersService.uploadImage(req.user.id, imageUrl);

    successResponse(res, { statusCode: 201, ...result });
  }),
);

export default router;
