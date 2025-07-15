import HttpException from "../../exceptions/Http.exception";

export function isHttpException(error: unknown): error is HttpException {
  return error instanceof Error && ("status" in error || "statusCode" in error);
}
