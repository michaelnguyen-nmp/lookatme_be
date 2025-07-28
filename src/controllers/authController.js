const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register
const register = async (req, res) => {
  try {
    const { fullName, userName, email, phoneNumber, password } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { userName }] });
    if (existing)
      return res
        .status(400)
        .json({ message: "Email or username already exists " });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName,
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(200).json({ message: "You have registered successfully! " });
  } catch (err) {
    res.status(500).json({ message: "Internal server error !", error: err });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    const user = await User.findOne({ userName });
    if (!user)
      return res.status(404).json({ message: "Invalid username.Try again !" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid password. Try again!" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error !", error: err });
  }
};

// Log out
const logout = async (req, res) => {
  res.status(200).json("Logged out");
};

module.exports = { register, login, logout };
