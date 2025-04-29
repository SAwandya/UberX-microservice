/**
 * @interface AuthClientInterface
 * Defines the contract for other services to communicate with the auth service
 */
class AuthClientInterface {
    /**
     * Validates a token
     * @param {string} token - The JWT token to validate
     * @returns {Promise<Object>} - Token validation result
     */
    async validateToken(token) {
        throw new Error('Method not implemented');
    }

    /**
     * Gets user information
     * @param {number} userId - The user ID
     * @returns {Promise<Object>} - User details (excluding sensitive info)
     */
    async getUser(userId) {
        throw new Error('Method not implemented');
    }

    /**
     * Checks if a user has a specific role
     * @param {number} userId - The user ID
     * @param {string} role - The role to check
     * @returns {Promise<boolean>} - Whether the user has the role
     */
    async hasRole(userId, role) {
        throw new Error('Method not implemented');
    }
}

module.exports = AuthClientInterface;