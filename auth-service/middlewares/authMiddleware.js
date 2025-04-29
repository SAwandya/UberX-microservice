const { verifyAccessToken } = require("../utils/tokenUtils");
const userRepository = require("../repositories/userRepository");

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};
