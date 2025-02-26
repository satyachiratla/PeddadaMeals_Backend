import HttpError from "../models/http-error.js";

export const handleError = (
  err,
  next,
  message = "An error occurred",
  statusCode = 500
) => {
  console.error(err);
  return next(new HttpError(message, statusCode));
};
