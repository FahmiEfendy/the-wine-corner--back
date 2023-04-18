const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user-models");
const HttpError = require("../models/http-error");

const getAllUser = async (req, res, next) => {
  let allUsers;
  try {
    allUsers = await User.find({}, "-password");
  } catch (err) {
    return next(
      new HttpError(`Failed to get all user because of ${err.message}`, 500)
    );
  }

  res.status(200).json({
    message: "Successfully get all user data!",
    data: allUsers.map((user) => user.toObject({ getters: true })),
  });
};

const register = async (req, res, next) => {
  const { username, password } = req.body;

  let userExist;
  try {
    userExist = await User.findOne({ username: username });
  } catch (err) {
    return next(
      new HttpError(`Cannot find a user with username of ${username}`, 500)
    );
  }

  if (userExist) {
    return next(
      new HttpError(`User with username of ${username} already exist!`, 422)
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

  const newUser = new User({
    username,
    password: hashedPassword,
  });

  try {
    await newUser.save();
  } catch (err) {
    return next(
      new HttpError(
        `Failed to create a new user because of ${err.message}`,
        500
      )
    );
  }

  let token;
  try {
    token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_TOKEN_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(
      new HttpError(`Failed to create a new user because of ${err.message}`)
    );
  }

  res.status(201).json({
    message: "Successfully added a new user!",
    data: { username: newUser.username, email: newUser.email, token },
  });
};

const login = async (req, res, next) => {
  const { username, password } = req.body;

  let userExist;
  try {
    userExist = await User.findOne({ username: username });
  } catch (err) {
    return next(
      new HttpError(`Cannot find a user with username of ${username}`, 500)
    );
  }

  if (!userExist)
    return next(
      new HttpError(`Invalid credential, please input correct username!`, 503)
    );

  let isPasswordValid = false;
  try {
    isPasswordValid = await bcrypt.compare(password, userExist.password);
  } catch (err) {
    return next(
      new HttpError(
        `Cannot logged you in because of ${err.message}, please try again.`
      )
    );
  }

  if (!isPasswordValid)
    return next(
      new HttpError("Invalid credential, please inpuit correct password!", 403)
    );

  let token;
  try {
    token = jwt.sign(
      {
        id: userExist.id,
        username: userExist.username,
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
    data: { userId: userExist.id, username: userExist.username, token },
  });
};

exports.getAllUser = getAllUser;

exports.register = register;
exports.login = login;
