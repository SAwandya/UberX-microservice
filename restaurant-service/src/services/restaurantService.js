const repo = require('../repositories/restaurantRepository');
exports.register = async(ownerId,payload) => repo.create({ownerId,...payload});
exports.getMine = async(ownerId) => repo.findByOwner(ownerId);
exports.approve = async(id) => repo.updateStatus(id, require('../utils/constants').RESTAURANT_STATUS.APPROVED);
exports.update = async(id,data)=>repo.update(id,data);
exports.delete = async(id)=>repo.delete(id);