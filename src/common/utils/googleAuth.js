import { OAuth2Client } from "google-auth-library";
import { env } from "../../../config/env.service.js";
import { UnauthorizedException } from "./apiError.js";

const client = new OAuth2Client(env.googleClientId);

export const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    });

    return ticket.getPayload();
  } catch {
    throw new UnauthorizedException("Invalid Google token");
  }
};
