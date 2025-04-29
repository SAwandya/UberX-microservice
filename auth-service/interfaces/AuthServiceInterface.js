class AuthServiceInterface {
    async register(userData) {
        throw new Error('Method not implemented');
    }

    async login(username, password) {
        throw new Error('Method not implemented');
    }

    async refreshToken(refreshToken) {
        throw new Error('Method not implemented');
    }

    async logout(userId, refreshToken) {
        throw new Error('Method not implemented');
    }

    async logoutAll(userId) {
        throw new Error('Method not implemented');
    }
}

module.exports = AuthServiceInterface;