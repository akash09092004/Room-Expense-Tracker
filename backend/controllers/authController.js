const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || ""
).trim().toLowerCase();
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "admin@123";

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = (
      email || ""
    ).trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role:
        normalizedEmail === ADMIN_EMAIL
          ? "admin"
          : "member",
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Auth login attempt:', req.body && { email: req.body.email });
    const { email, password } = req.body;
    const normalizedEmail = (
      email || ""
    ).trim().toLowerCase();
    const isAdminLogin =
      normalizedEmail === ADMIN_EMAIL;

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user && isAdminLogin) {
      const adminPasswordHash =
        await bcrypt.hash(
          ADMIN_PASSWORD,
          10
        );

      user = await User.create({
        name: "Admin",
        email: normalizedEmail,
        password: adminPasswordHash,
        role: "admin",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (isAdminLogin) {
      isMatch = password === ADMIN_PASSWORD;
    }

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    if (isAdminLogin && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
