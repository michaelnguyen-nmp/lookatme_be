import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("AUTH", authHeader);
  const token = authHeader?.split(" ")[1];
  console.log("TOKEN", token);

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });

    req.user = user; // user = { id, ... }
    next();
  });
};

export default verifyToken;
