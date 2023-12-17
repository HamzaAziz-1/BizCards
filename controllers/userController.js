const { User, userValidationSchema } = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const chalk = require("chalk");
const CustomError = require("../errors");
const {
  attachCookiesToResponse,
  createTokenUser,
  createJWT,
} = require("../utils/jwt");


const register = async (req, res) => {
  try {
    // Validate the request data
    const validationResult = userValidationSchema.validate(req.body, {
      abortEarly: false, // Collect all validation errors
      allowUnknown: true, // Allow unknown fields
    });

    if (validationResult.error) {
      const errorMessage = validationResult.error.details[0].message;
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: errorMessage });
    }

    const { email, name, password, isBusiness, phone, address, image } =
      req.body;

    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Email already exists" });
    }

    // first registered user is an admin
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? "admin" : "user";

    const user = await User.create({
      email,
      name,
      password,
      isBusiness,
      phone,
      address,
      image,
      role,
    });

    res.status(StatusCodes.CREATED).json({
      msg: "User Registered Successfully!",
    });
  } catch (error) {
    // Handle other errors
    console.error(error);
    if (error instanceof CustomError.HttpError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Email does not exist");
  }
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const tokenUser = createTokenUser(user);
  const token = createJWT({ payload: { user:tokenUser } });
  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
    sameSite: "none",
  });
  res.status(StatusCodes.OK).json({ token });
  return;
};
const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

const getAllUsers = async (req, res) => {
  const users = await User.find({
    role: { $in: ["tourist", "vendor"] },
  }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

module.exports = {
  register,
  login,
  logout,
  getAllUsers
};
