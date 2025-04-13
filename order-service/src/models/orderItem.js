class OrderItem {
    constructor(
        id,
        orderId,
        itemId,
        itemName,
        quantity,
        unitPrice,
        subtotal,
        notes
    ) {
        this.id = id;
        this.orderId = orderId;
        this.itemId = itemId;
        this.itemName = itemName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
        this.notes = notes;
    }

    static fromDatabase(dbRow) {
        return new OrderItem(
            dbRow.id,
            dbRow.order_id,
            dbRow.item_id,
            dbRow.item_name,
            dbRow.quantity,
            dbRow.unit_price,
            dbRow.subtotal,
            dbRow.notes
        );
    }
}

module.exports = OrderItem;