class RestaurantServiceInterface {
    async register(ownerId, payload) {
        throw new Error('Method not implemented');
    }

    async getMine(ownerId) {
        throw new Error('Method not implemented');
    }

    async approve(id) {
        throw new Error('Method not implemented');
    }

    async update(id, data) {
        throw new Error('Method not implemented');
    }

    async delete(id) {
        throw new Error('Method not implemented');
    }
}

module.exports = RestaurantServiceInterface;