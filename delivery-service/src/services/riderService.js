const riderRepository = require('../repositories/riderRepository');

exports.createRider = async (riderData) => {
  try {
    const newRider = await riderRepository.createRider(riderData);
    return newRider;
  } catch (error) {
    throw new Error(`Failed to create rider: ${error.message}`);
  }
};
