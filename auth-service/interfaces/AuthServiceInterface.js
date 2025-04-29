/**
 * @interface AuthServiceInterface
 * Defines the contract for authentication service operations
 */
class AuthServiceInterface {
    /**
     * Registers a new user
     * @param {Object} userData - User registration details
     * @returns {Promise<Object>} - The created user
     */
    async register(userData) {
        throw new Error('Method not implemented');
    }

    /**
     * Authenticates a user and returns tokens
     * @param {string} username - User's username
     * @param {string} password - User's password
     * @returns {Promise<Object>} - User and tokens
     */
    async login(username, password) {
        throw new Error('Method not implemented');
    }

    /**
     * Refreshes access token using refresh token
     * @param {string} refreshToken - The refresh token
     * @returns {Promise<Object>} - New tokens
     */
    async refreshToken(refreshToken) {
        throw new Error('Method not implemented');
    }

    /**
     * Logs out a user
     * @param {number} userId - The user's ID 
     * @param {string} refreshToken - The refresh token
     * @returns {Promise<boolean>} - Success indicator
     */
    async logout(userId, refreshToken) {
        throw new Error('Method not implemented');
    }

    /**
     * Logs out a user from all devices
     * @param {number} userId - The user's ID
     * @returns {Promise<boolean>} - Success indicator
     */
    async logoutAll(userId) {
        throw new Error('Method not implemented');
    }
}

module.exports = AuthServiceInterface;