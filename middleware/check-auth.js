const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

const checkToken = (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) throw new Error("Authentication failed!");

    const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_KEY);
    req.userData = { id: decodedToken.id };
    next();
  } catch (err) {
    if (!token) {
      return next(
        new HttpError(`Authentication failed because of ${err.message},403`)
      );
    }
  }
};

module.exports = checkToken;
