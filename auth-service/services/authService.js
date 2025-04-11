const userRepository = require("../repositories/userRepository");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateRefreshTokenHash,
} = require("../utils/tokenUtils");
const { REFRESH_TOKEN } = require("../config/jwt");


exports.register = async (userData) => {
  // Check if user already exists
  const existingUser = await userRepository.findByUsername(userData.username);
  if (existingUser) {
    throw new Error("Username already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user
  const user = await userRepository.createUser({
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
};

exports.login = async (username, password) => {
  // Find user
  const user = await userRepository.findByUsername(username);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token hash
  const refreshTokenHash = generateRefreshTokenHash(refreshToken);
  await userRepository.saveRefreshToken(
    user.id,
    refreshTokenHash,
    refreshToken,
    REFRESH_TOKEN.expiry
  );

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

exports.refreshToken = async (refreshToken) => {
  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw new Error("Invalid refresh token");
  }

  // Find user
  const user = await userRepository.findById(decoded.userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Verify token exists in database
  const refreshTokenHash = generateRefreshTokenHash(refreshToken);
  const storedToken = await userRepository.findRefreshToken(
    user.id,
    refreshTokenHash
  );
  if (!storedToken) {
    throw new Error("Invalid refresh token");
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  // Replace old refresh token with new one
  await userRepository.deleteRefreshToken(user.id, refreshTokenHash);
  const newRefreshTokenHash = generateRefreshTokenHash(newRefreshToken);
  await userRepository.saveRefreshToken(user.id, newRefreshTokenHash);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

exports.logout = async (userId, refreshToken) => {
  if (!refreshToken) return true;

  const refreshTokenHash = generateRefreshTokenHash(refreshToken);
  return await userRepository.deleteRefreshToken(userId, refreshTokenHash);
};

exports.logoutAll = async (userId) => {
  return await userRepository.deleteAllRefreshTokens(userId);
};
