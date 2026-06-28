import bcrypt from "bcrypt";
import { env } from "../../../config/env.service.js";

export const generateHash = async (plainText) => {
  const saltRounds = Number(env.bcryptSaltRounds) || 10;
  const hash = await bcrypt.hash(plainText, saltRounds);
  return hash;
};

export const compareHash = async (plainText, hash) => {
  const isMatch = await bcrypt.compare(plainText, hash);
  return isMatch;
};
