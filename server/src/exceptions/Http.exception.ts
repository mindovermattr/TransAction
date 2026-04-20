class HttpException extends Error {
  status: number;
  code: string;
  details?: unknown;
  message: string;
  constructor(
    status: number,
    message: string,
    code = "BAD_REQUEST",
    details?: unknown,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.message = message;
  }
}

export default HttpException;
