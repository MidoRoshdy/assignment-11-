import express from "express";
import cors from "cors";
import path from "path";
import { connectDB } from "./database/connection.js";
import usersController from "./module/users/users.controller.js";
import { globalErrorHandler } from "./common/middleware/error.middleware.js";
import { successResponse } from "./common/utils/response.js";
import { validate } from "./common/middleware/validate.middleware.js";
import { asyncHandler } from "./common/utils/asyncHandler.js";
import { googleLoginSchema } from "./module/users/users.validation.js";
import * as usersService from "./module/users/users.service.js";
import { env } from "../config/env.service.js";

export const bootstrap = async () => {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use("/uploads", express.static(path.resolve("uploads")));
  await connectDB();

  app.use("/api/users", usersController);

  app.post(
    "/auth/google-login",
    validate(googleLoginSchema),
    asyncHandler(async (req, res) => {
      const result = await usersService.googleLogin(req.body);
      successResponse(res, result);
    }),
  );

  app.get("/checkHealth", (req, res) => {
    successResponse(res, { message: "Server is running" });
  });

  app.use(globalErrorHandler);

  const port = env.port || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};
