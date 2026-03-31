export class UnWebError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'UnWebError';
  }
}

export class AuthError extends UnWebError {
  constructor(message: string, statusCode?: number, response?: Record<string, unknown>) {
    super(message, statusCode, response);
    this.name = 'AuthError';
  }
}

export class QuotaExceededError extends UnWebError {
  constructor(message: string, statusCode?: number, response?: Record<string, unknown>) {
    super(message, statusCode, response);
    this.name = 'QuotaExceededError';
  }
}

export class NotFoundError extends UnWebError {
  constructor(message: string, statusCode?: number, response?: Record<string, unknown>) {
    super(message, statusCode, response);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends UnWebError {
  constructor(message: string, statusCode?: number, response?: Record<string, unknown>) {
    super(message, statusCode, response);
    this.name = 'ValidationError';
  }
}
