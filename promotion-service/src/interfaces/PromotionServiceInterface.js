class PromotionServiceInterface {
    async validatePromotion(data) {
        throw new Error('Method not implemented');
    }

    async redeemPromotion(data) {
        throw new Error('Method not implemented');
    }

    async createPromotion(data) {
        throw new Error('Method not implemented');
    }

    async getActivePromotions() {
        throw new Error('Method not implemented');
    }

    async getPromotionByCode(code) {
        throw new Error('Method not implemented');
    }
}

module.exports = PromotionServiceInterface;