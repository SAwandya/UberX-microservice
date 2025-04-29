class RestaurantClientInterface {
    async getRestaurant(restaurantId) {
        throw new Error('Method not implemented');
    }

    async isRestaurantAvailable(restaurantId) {
        throw new Error('Method not implemented');
    }

    async getRestaurantMenu(restaurantId) {
        throw new Error('Method not implemented');
    }

    async validateMenuItems(restaurantId, items) {
        throw new Error('Method not implemented');
    }

    async getEstimatedPrepTime(restaurantId, items) {
        throw new Error('Method not implemented');
    }
}

module.exports = RestaurantClientInterface;