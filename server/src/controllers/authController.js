import bcrypt from "bcryptjs";
import { body } from "express-validator";
import { User } from "../models/User.js";
import { signToken } from "../utils/token.js";

const authPayload = (user) => ({
  token: signToken(user._id),
  user: {
    id: user._id,
    username: user.username,
    email: user.email
  }
});

export const registerValidators = [
  body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 chars."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars.")
];

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    return res.status(409).json({ message: "User with email or username already exists." });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hashed
  });

  return res.status(201).json(authPayload(user));
};

export const loginValidators = [
  body("identity").trim().notEmpty().withMessage("Email or username is required."),
  body("password").notEmpty().withMessage("Password is required.")
];

export const login = async (req, res) => {
  const { identity, password } = req.body;
  const user = await User.findOne({
    $or: [{ email: identity.toLowerCase() }, { username: identity }]
  });
  if (!user || !user.password) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  return res.json(authPayload(user));
};
