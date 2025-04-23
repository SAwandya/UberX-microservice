class Restaurant {
    constructor(id, ownerId, name, address, images, isAvailable, status) {
      this.id = id;
      this.ownerId = ownerId;
      this.name = name;
      this.address = address;
      this.images = images;
      this.isAvailable = isAvailable;
      this.status = status;
    }
  }
  module.exports = Restaurant;