import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "User not authenticated." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.id = decoded.userId;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.error("Token expired at:", error.expiredAt);
      return res.status(401).json({ message: "Invalid token." });
    }
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export default isAuthenticated;
