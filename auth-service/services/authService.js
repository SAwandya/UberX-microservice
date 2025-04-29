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

/**
 * Implementation of the AuthServiceInterface
 */
class AuthService extends AuthServiceInterface {
  /**
   * Registers a new user
   * @param {Object} userData - User registration details
   * @returns {Promise<Object>} - The created user
   */
  async register(userData) {
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
  }

  /**
   * Authenticates a user and returns tokens
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<Object>} - User and tokens
   */
  async login(username, password) {
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
  }

  /**
   * Refreshes access token using refresh token
   * @param {string} refreshToken - The refresh token
   * @returns {Promise<Object>} - New tokens
   */
  async refreshToken(refreshToken) {
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
    await userRepository.saveRefreshToken(user.id, newRefreshTokenHash, newRefreshToken, REFRESH_TOKEN.expiry);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logs out a user
   * @param {number} userId - The user's ID 
   * @param {string} refreshToken - The refresh token
   * @returns {Promise<boolean>} - Success indicator
   */
  async logout(userId, refreshToken) {
    if (!refreshToken) return true;

    const refreshTokenHash = generateRefreshTokenHash(refreshToken);
    return await userRepository.deleteRefreshToken(userId, refreshTokenHash);
  }

  /**
   * Logs out a user from all devices
   * @param {number} userId - The user's ID
   * @returns {Promise<boolean>} - Success indicator
   */
  async logoutAll(userId) {
    return await userRepository.deleteAllRefreshTokens(userId);
  }
}

// Export a singleton instance of the service
module.exports = new AuthService();
