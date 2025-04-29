const axios = require('axios');
const AuthClientInterface = require('../interfaces/AuthClientInterface');

class AuthClient extends AuthClientInterface {
    constructor() {
        super();
        this.baseUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service.uberx-auth.svc.cluster.local:3000/api/auth';
        this.serviceToken = process.env.INTERNAL_SERVICE_TOKEN || 'internal-service-token';
    }

    _getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-service-token': this.serviceToken
        };
    }

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