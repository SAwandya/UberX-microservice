class Trip {
    constructor(id, orderId, riderId, customerId, status, startLocation, endLocation, createdAt, updatedAt) {
        this.id = id;
        this.orderId = orderId;
        this.riderId = riderId;
        this.customerId = customerId;
        this.status = status;
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

module.exports = Trip;