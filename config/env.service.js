import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve("./config/.env"),
});

export const env = {
  port: process.env.PORT,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
  email: process.env.EMAIL,
  emailPass: process.env.EMAIL_PASS,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3001",
};
