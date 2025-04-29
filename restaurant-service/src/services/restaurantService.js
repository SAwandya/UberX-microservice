const repo = require('../repositories/restaurantRepository');
const RestaurantServiceInterface = require('../interfaces/RestaurantServiceInterface');
const { RESTAURANT_STATUS } = require('../utils/constants');

class RestaurantService extends RestaurantServiceInterface {
    async register(ownerId, payload) {
        return repo.create({ ownerId, ...payload });
    }

    async getMine(ownerId) {
        return repo.findByOwner(ownerId);
    }

    async approve(id) {
        return repo.updateStatus(id, RESTAURANT_STATUS.APPROVED);
    }

    async update(id, data) {
        return repo.update(id, data);
    }

    async delete(id) {
        await repo.delete(id);
        return true;
    }
}

module.exports = new RestaurantService();