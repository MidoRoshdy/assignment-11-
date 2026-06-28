export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class BadRequestException extends ApiError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedException extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenException extends ApiError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundException extends ApiError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}
