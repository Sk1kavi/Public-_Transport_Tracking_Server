const Bus = require("../models/Bus");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.adminRegister = async (req, res) => {
  try {
    const { name, number, mailId, password } = req.body;

    const existing = await Admin.findOne({ mailId });
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({ name, number, mailId, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { mailId, password } = req.body;

    // Find admin by mailId
    const admin = await Admin.findOne({ mailId });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT token using secret from .env
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET_KEY,   //from .env
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add new bus
exports.addBus = async (req, res) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete/Deactivate bus
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    res.json(bus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
