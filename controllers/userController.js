const Bus = require("../models/Bus");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.userRegister = async (req, res) => {
  try {
    const { name, number, mailId, password } = req.body;

    const existing = await User.findOne({ mailId });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, number, mailId, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { mailId, password } = req.body;

    // Find user by mailId
    const user = await User.findOne({ mailId });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT token with .env secret
    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET_KEY,   // secure, from .env
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


