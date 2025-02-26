class HttpError extends Error {
  constructor(message, errorCode) {
    super(message);
    this.error = errorCode;
  }
}

export default HttpError;
