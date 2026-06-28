import jwt from "jsonwebtoken";
import { env } from "../../../config/env.service.js";

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtAccessExpiresIn || "15m",
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn || "7d",
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwtRefreshSecret);
};
