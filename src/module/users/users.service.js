import userModel from "../../database/models/user.model.js";
import { generateHash, compareHash } from "../../common/utils/generateHash.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../common/utils/token.js";
import { sendOtpEmail } from "../../common/utils/mailer.js";
import { verifyGoogleToken } from "../../common/utils/googleAuth.js";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/utils/apiError.js";

const OTP_EXPIRY_MINUTES = 10;

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const saveOtp = async (user) => {
  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await user.save();
  await sendOtpEmail(user.email, otp);
};

const formatUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  isActive: user.isActive,
  profileImage: user.profileImage,
});

const issueTokens = async (user) => {
  const payload = { id: user._id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken, payload };
};

export const signup = async ({ fullName, email, password, profileImage }) => {
  const existingUser = await userModel.findOne({ email });

  if (existingUser) {
    throw new BadRequestException("Email already exists");
  }

  const hashedPassword = await generateHash(password);

  const user = await userModel.create({
    fullName,
    email,
    password: hashedPassword,
    profileImage: profileImage || null,
    isActive: false,
  });

  await saveOtp(user);

  return {
    user: formatUser(user),
    message: "Account created. Please verify your email with the OTP sent.",
  };
};

export const login = async ({ email, password }) => {
  const user = await userModel.findOne({ email });

  if (!user) {
    throw new BadRequestException("Invalid email or password");
  }

  if (user.provider === "google" || !user.password) {
    throw new BadRequestException("Please login with Google");
  }

  const isPasswordValid = await compareHash(password, user.password);

  if (!isPasswordValid) {
    throw new BadRequestException("Invalid email or password");
  }

  if (!user.isActive) {
    throw new ForbiddenException(
      "Account is inactive. Please verify your email with the OTP.",
    );
  }

  const { accessToken, refreshToken, payload } = await issueTokens(user);

  return {
    user: formatUser(user),
    accessToken,
    refreshToken,
    payload,
  };
};

export const verifyOtp = async ({ email, otp }) => {
  const user = await userModel.findOne({ email });

  if (!user) {
    throw new NotFoundException("User not found");
  }

  if (user.isActive) {
    throw new BadRequestException("Account is already active");
  }

  if (!user.otp || !user.otpExpiresAt) {
    throw new BadRequestException("No OTP found. Please request a new one.");
  }

  if (user.otpExpiresAt < new Date()) {
    throw new BadRequestException("OTP has expired. Please request a new one.");
  }

  if (user.otp !== otp) {
    throw new BadRequestException("Invalid OTP");
  }

  user.isActive = true;
  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();

  const { accessToken, refreshToken, payload } = await issueTokens(user);

  return {
    user: formatUser(user),
    accessToken,
    refreshToken,
    payload,
    message: "Account activated successfully",
  };
};

export const resendOtp = async ({ email }) => {
  const user = await userModel.findOne({ email });

  if (!user) {
    throw new NotFoundException("User not found");
  }

  if (user.isActive) {
    throw new BadRequestException("Account is already active");
  }

  await saveOtp(user);

  return {
    message: "A new OTP has been sent to your email",
  };
};

export const refreshToken = async ({ refreshToken: token }) => {
  let decoded;

  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new UnauthorizedException("Invalid or expired refresh token");
  }

  const user = await userModel.findById(decoded.id);

  if (!user || user.refreshToken !== token) {
    throw new UnauthorizedException("Invalid refresh token");
  }

  if (!user.isActive) {
    throw new ForbiddenException("Account is inactive");
  }

  const { accessToken, refreshToken, payload } = await issueTokens(user);

  return {
    user: formatUser(user),
    accessToken,
    refreshToken,
    payload,
  };
};

export const googleLogin = async ({ idToken }) => {
  const googlePayload = await verifyGoogleToken(idToken);
  const { sub: googleId, email, name, picture } = googlePayload;

  if (!email) {
    throw new BadRequestException("Google account email is required");
  }

  let user = await userModel.findOne({ googleId });

  if (!user) {
    user = await userModel.findOne({ email });

    if (user) {
      if (user.provider === "local" && !user.googleId) {
        user.googleId = googleId;
        user.provider = "google";

        if (!user.profileImage && picture) {
          user.profileImage = picture;
        }

        await user.save();
      }
    } else {
      user = await userModel.create({
        fullName: name || email.split("@")[0],
        email,
        googleId,
        provider: "google",
        isActive: true,
        profileImage: picture || null,
      });
    }
  }

  if (!user.isActive) {
    throw new ForbiddenException("Account is inactive");
  }

  const { accessToken, refreshToken, payload } = await issueTokens(user);

  return {
    user: formatUser(user),
    accessToken,
    refreshToken,
    payload,
  };
};

export const getProfile = async (userId) => {
  const user = await userModel.findById(userId);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  return { user: formatUser(user) };
};

export const uploadImage = async (userId, imageUrl) => {
  const user = await userModel.findById(userId);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  user.profileImage = imageUrl;
  await user.save();

  return { imageUrl, user: formatUser(user) };
};
