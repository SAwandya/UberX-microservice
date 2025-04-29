class AuthClientInterface {
    async validateToken(token) {
        throw new Error('Method not implemented');
    }

    async getUser(userId) {
        throw new Error('Method not implemented');
    }

    async hasRole(userId, role) {
        throw new Error('Method not implemented');
    }
}

module.exports = AuthClientInterface;