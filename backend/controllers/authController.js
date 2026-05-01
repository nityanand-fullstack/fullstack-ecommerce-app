import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const emailRegex = /^\S+@\S+\.\S+$/;
const phoneRegex = /^\+?\d{7,15}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

const buildErrors = (pairs) =>
  pairs.filter(([, msg]) => msg).map(([field, message]) => ({ field, message }));

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const errors = buildErrors([
      ["name", !name || name.trim().length < 2 ? "Name must be at least 2 characters" : null],
      ["email", !email ? "Email is required" : !emailRegex.test(email) ? "Invalid email format" : null],
      ["password", !password ? "Password is required" : !passwordRegex.test(password) ? "Password must be at least 6 chars and include a letter and a digit" : null],
      ["phone", phone && !phoneRegex.test(phone) ? "Invalid phone number" : null],
    ]);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email,
      password,
      phone,
      address,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { user: user.toJSON(), token },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user: user.toJSON(), token },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/profile
export const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: { user: req.user.toJSON() },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const errors = buildErrors([
      ["name", name !== undefined && (typeof name !== "string" || name.trim().length < 2) ? "Name must be at least 2 characters" : null],
      ["phone", phone !== undefined && phone !== "" && !phoneRegex.test(phone) ? "Invalid phone number" : null],
    ]);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    if (name !== undefined) req.user.name = name.trim();
    if (phone !== undefined) req.user.phone = phone;
    if (address !== undefined) req.user.address = address;

    const updated = await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      data: { user: updated.toJSON() },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 chars and include a letter and a digit",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const match = await user.matchPassword(currentPassword);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    next(err);
  }
};
