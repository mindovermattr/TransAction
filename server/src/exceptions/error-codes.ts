const ERROR_CODE_DICTIONARY = {
  BAD_REQUEST: "request.bad_request",
  VALIDATION_ERROR: "request.validation",
  EMPTY_REQUEST_BODY: "request.empty_body",
  UNAUTHORIZED: "auth.unauthorized",
  INVALID_TOKEN: "auth.invalid_token",
  TOKEN_EXPIRED: "auth.token_expired",
  USER_ALREADY_EXISTS: "auth.user_already_exists",
  USER_NOT_FOUND: "auth.user_not_found",
  INVALID_CREDENTIALS: "auth.invalid_credentials",
  INVALID_TRANSACTION_ID: "transaction.invalid_id",
  TRANSACTION_NOT_FOUND: "transaction.not_found",
  INVALID_INCOME_ID: "income.invalid_id",
  INCOME_NOT_FOUND: "income.not_found",
  INTERNAL_ERROR: "system.internal_error",
} as const;

const resolveSemanticErrorCode = (code: string | undefined, status: number) => {
  if (code && code in ERROR_CODE_DICTIONARY) {
    return ERROR_CODE_DICTIONARY[code as keyof typeof ERROR_CODE_DICTIONARY];
  }

  if (status >= 500) {
    return ERROR_CODE_DICTIONARY.INTERNAL_ERROR;
  }

  return ERROR_CODE_DICTIONARY.BAD_REQUEST;
};

export { ERROR_CODE_DICTIONARY, resolveSemanticErrorCode };
