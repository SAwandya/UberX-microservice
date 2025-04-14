// order-service/models/Order.js
class Order {
    constructor(id, customerId, restaurantId, totalBill, deliveryFee, status, orderPrepareTime = null, riderId = null, paymentId = null, deliveryId = null, createdAt = null, updatedAt = null) {
        this.id = id;
        this.customerId = customerId;
        this.restaurantId = restaurantId;
        this.totalBill = totalBill;
        this.deliveryFee = deliveryFee;
        this.status = status;
        this.orderPrepareTime = orderPrepareTime;
        this.riderId = riderId;
        this.paymentId = paymentId;
        this.deliveryId = deliveryId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

module.exports = Order;