import { FetchError } from "ofetch";

const isOfetchError = (
  error: unknown,
): error is FetchError<{ message: string }> => {
  return error instanceof FetchError && typeof error.data?.message === "string";
};

export { isOfetchError };
