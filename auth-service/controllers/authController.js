const authService = require("../services/authService");
const { verifyAccessToken } = require("../utils/tokenUtils");

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await authService.register({ username, email, password });
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const result = await authService.login(username, password);

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      user: result.user,
      accessToken: result.tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.validateToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = verifyAccessToken(token); // throws if invalid
    console.log("Decoded token:", decoded); // ✅ add this for debugging
    res.sendStatus(204); // ✅ VERY IMPORTANT: No body
  } catch (err) {
    res.sendStatus(401);
  }

};


exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const tokens = await authService.refreshToken(refreshToken);

    // Set new refresh token as HTTP-only cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (req.user && req.user.id) {
      await authService.logout(req.user.id, refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

exports.logoutAll = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    await authService.logoutAll(req.user.id);

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out from all devices successfully" });
  } catch (error) {
    next(error);
  }
};
