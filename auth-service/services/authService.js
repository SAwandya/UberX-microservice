const userRepository = require("../repositories/userRepository");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateRefreshTokenHash,
} = require("../utils/tokenUtils");
const { REFRESH_TOKEN } = require("../config/jwt");
const AuthServiceInterface = require("../interfaces/AuthServiceInterface");

class AuthService extends AuthServiceInterface {
  async register(userData) {
    const existingUser = await userRepository.findByUsername(userData.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const hashedPassword = await hashPassword(userData.password);

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
  }

  async login(username, password) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

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
  }

  async refreshToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error("Invalid refresh token");
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const refreshTokenHash = generateRefreshTokenHash(refreshToken);
    const storedToken = await userRepository.findRefreshToken(
      user.id,
      refreshTokenHash
    );
    if (!storedToken) {
      throw new Error("Invalid refresh token");
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    await userRepository.deleteRefreshToken(user.id, refreshTokenHash);
    const newRefreshTokenHash = generateRefreshTokenHash(newRefreshToken);
    await userRepository.saveRefreshToken(user.id, newRefreshTokenHash, newRefreshToken, REFRESH_TOKEN.expiry);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId, refreshToken) {
    if (!refreshToken) return true;

    const refreshTokenHash = generateRefreshTokenHash(refreshToken);
    return await userRepository.deleteRefreshToken(userId, refreshTokenHash);
  }

  async logoutAll(userId) {
    return await userRepository.deleteAllRefreshTokens(userId);
  }
}

module.exports = new AuthService();
