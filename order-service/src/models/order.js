class Order {
    constructor(
        id,
        userId,
        status,
        totalAmount,
        deliveryAddress,
        paymentMethod,
        paymentStatus,
        createdAt,
        updatedAt,
        items = []
    ) {
        this.id = id;
        this.userId = userId;
        this.status = status;
        this.totalAmount = totalAmount;
        this.deliveryAddress = deliveryAddress;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.items = items;
    }

    static fromDatabase(dbRow, items = []) {
        return new Order(
            dbRow.id,
            dbRow.user_id,
            dbRow.status,
            dbRow.total_amount,
            dbRow.delivery_address,
            dbRow.payment_method,
            dbRow.payment_status,
            dbRow.created_at,
            dbRow.updated_at,
            items
        );
    }
}

module.exports = Order;