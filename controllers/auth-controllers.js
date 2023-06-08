const uuid = require("uuid");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

const mySqlPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const getAllUser = (req, res, next) => {
  const query = "SELECT * FROM users";
  mySqlPool.query(query, (error, results) => {
    if (error) {
      return next(
        new HttpError(
          `Failed to get all users because of ${error.message}`,
          500
        )
      );
    }
    res.status(200).json({
      message: "Successfully get all user data!",
      data: results,
    });
  });
};

const register = (req, res, next) => {
  const { username, password } = req.body;

  let id = uuid.v4();

  const query = "SELECT * FROM users WHERE username = ?";
  mySqlPool.query(query, [username], async (error, results) => {
    if (error) {
      return next(
        new HttpError(`Cannot find a user with username of ${username}`, 500)
      );
    }

    if (results.length > 0) {
      return next(
        new HttpError(`User with username of ${username} already exists!`, 422)
      );
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      return next(
        new HttpError(
          `Could not create a new user because of ${err.message}`,
          500
        )
      );
    }

    const insertQuery =
      "INSERT INTO users (id, username, password) VALUES (?,?, ?)";
    mySqlPool.query(insertQuery, [id, username, hashedPassword], (error) => {
      if (error) {
        return next(
          new HttpError(
            `Failed to create a new user because of ${error.message}`,
            500
          )
        );
      }

      let token;
      try {
        token = jwt.sign({ id, username }, process.env.JWT_TOKEN_KEY, {
          expiresIn: "1h",
        });
      } catch (err) {
        return next(
          new HttpError(`Failed to create a new user because of ${err.message}`)
        );
      }

      res.status(201).json({
        message: "Successfully added a new user!",
        data: { username, token },
      });
    });
  });
};

const login = (req, res, next) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ?";
  mySqlPool.query(query, [username], async (error, results) => {
    if (error) {
      return next(
        new HttpError(`Cannot find a user with username of ${username}`, 500)
      );
    }

    if (results.length === 0) {
      return next(
        new HttpError(`Invalid credential, please input correct username!`, 503)
      );
    }

    const user = results[0];
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (err) {
      return next(
        new HttpError(
          `Cannot log you in because of ${err.message}, please try again.`
        )
      );
    }

    if (!isPasswordValid) {
      return next(
        new HttpError("Invalid credential, please input correct password!", 403)
      );
    }

    let token;
    try {
      token = jwt.sign(
        {
          id: user.id,
          username: user.username,
        },
        process.env.JWT_TOKEN_KEY,
        { expiresIn: "1h" }
      );
    } catch (err) {
      return next(
        new HttpError(
          `Invalid credential, please input correct username and password`,
          500
        )
      );
    }

    res.status(200).json({
      message: "Login Success!",
      data: { userId: user.id, username: user.username, token },
    });
  });
};

exports.getAllUser = getAllUser;
exports.register = register;
exports.login = login;
