import HttpError from "../models/http-error.js";
import jwt from "jsonwebtoken";

export default function (req, res, next) {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      throw new Error("Authentication Failed!");
    }

    const decodedToken = jwt.verify(token, "supersecret_dont_share");
    console.log("decodedToken--->", decodedToken);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    console.log("expires-->", err);
    return next(new HttpError("Authentication Failed!", 401));
  }
}
