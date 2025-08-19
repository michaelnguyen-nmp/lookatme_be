import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// JWT
export const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_ACCESS_KEY, {
    expiresIn: "15d",
  });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_KEY, {
    expiresIn: "365d",
  });
};

export const refreshToken = (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token)
    return res.status(401).json({ message: "No refresh token found" });

  jwt.verify(token, process.env.JWT_REFRESH_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = generateAccessToken(user);
    res.json({ message: "New access token ", accessToken: newAccessToken });
  });
};

// Register
export const register = async (req, res) => {
  try {
    const { fullname, username, email, phoneNumber, password } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res
        .status(400)
        .json({ message: "Email or username already exists " });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      fullname,
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
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user)
      return res.status(404).json({ message: "Invalid username. Try again!" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid password. Try again!" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Storage refreshToken into cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    // Return user & accessToken
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        phoneNumber: user.phoneNumber,
        email: user.email,
        avatar: user.avatar,
        cover: user.cover,
        bio: user.bio,
        location: user.location,
        followers: user.followers,
        following: user.following,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error !", error: err });
  }
};

// Log out
export const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/auth/refresh",
    });
    res.status(200).json("Logged out");
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
};
