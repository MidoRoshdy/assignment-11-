import { verifyAccessToken } from "../utils/token.js";
import { UnauthorizedException } from "../utils/apiError.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedException("Unauthorized"));
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new UnauthorizedException("Unauthorized"));
  }
};
