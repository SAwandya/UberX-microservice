const axios = require('axios');
const AuthClientInterface = require('../interfaces/AuthClientInterface');

/**
 * Implementation of AuthClientInterface for service-to-service communication
 */
class AuthClient extends AuthClientInterface {
    constructor() {
        super();
        this.baseUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service.uberx-auth.svc.cluster.local:3000/api/auth';
        this.serviceToken = process.env.INTERNAL_SERVICE_TOKEN || 'internal-service-token';
    }

    /**
     * Sets up common headers for service-to-service communication
     * @returns {Object} - Headers object
     * @private
     */
    _getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-service-token': this.serviceToken
        };
    }

    /**
     * Validates a token
     * @param {string} token - The JWT token to validate
     * @returns {Promise<Object>} - Token validation result
     */
    async validateToken(token) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/validate`,
                { token },
                { headers: this._getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error validating token:', error.message);
            throw new Error(`Token validation failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Gets user information
     * @param {number} userId - The user ID
     * @returns {Promise<Object>} - User details (excluding sensitive info)
     */
    async getUser(userId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/users/${userId}`,
                { headers: this._getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error(`Error fetching user ${userId}:`, error.message);
            throw new Error(`Failed to get user: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Checks if a user has a specific role
     * @param {number} userId - The user ID
     * @param {string} role - The role to check
     * @returns {Promise<boolean>} - Whether the user has the role
     */
    async hasRole(userId, role) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/check-role`,
                { userId, role },
                { headers: this._getHeaders() }
            );
            return response.data.hasRole;
        } catch (error) {
            console.error(`Error checking role for user ${userId}:`, error.message);
            throw new Error(`Failed to check role: ${error.response?.data?.message || error.message}`);
        }
    }
}

module.exports = new AuthClient();