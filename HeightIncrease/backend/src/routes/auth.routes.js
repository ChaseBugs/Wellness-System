const express = require("express");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { authenticate } = require("../middleware/auth");
const HttpError = require("../utils/httpError");
const signToken = require("../utils/token");

const router = express.Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, measurements } = req.body;

    if (!name || !email || !password) {
      throw new HttpError(400, "Name, email and password are required");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new HttpError(409, "Email is already registered");
    }

    const user = new User({ name, email, measurements });
    user.password = password;
    await user.save();

    res.status(201).json({
      user,
      token: signToken(user)
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError(400, "Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user || !(await user.comparePassword(password))) {
      throw new HttpError(401, "Invalid email or password");
    }

    if (user.status !== "active") {
      throw new HttpError(403, "Your account is blocked");
    }

    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      user,
      token: signToken(user)
    });
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

module.exports = router;
