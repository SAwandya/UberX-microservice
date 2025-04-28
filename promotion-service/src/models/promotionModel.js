// src/models/promotionModel.js
class Promotion {
  constructor(row) {
    this.id = row.id;
    this.code = row.code;
    this.type = row.type;
    this.amount = row.amount;
    this.maxDiscount = row.maxDiscount;
    this.minOrderValue = row.minOrderValue;
    this.startDate = row.startDate;
    this.endDate = row.endDate;
    this.usageLimit = row.usageLimit;
    this.perUserLimit = row.perUserLimit;
    this.applicableRestaurants = row.applicableRestaurants
      ? JSON.parse(row.applicableRestaurants)
      : [];
    this.applicableUsers = row.applicableUsers
      ? JSON.parse(row.applicableUsers)
      : [];
    this.status = row.status;
    this.created_at = row.created_at;
    this.updated_at = row.updated_at;
  }
}

module.exports = { Promotion };
