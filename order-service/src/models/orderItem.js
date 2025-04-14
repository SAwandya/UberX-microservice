class OrderItem {
    constructor(id, orderId, foodItemId, quantity, price) {
        this.id = id;
        this.orderId = orderId;
        this.foodItemId = foodItemId;
        this.quantity = quantity;
        this.price = price;
    }
}

module.exports = OrderItem;