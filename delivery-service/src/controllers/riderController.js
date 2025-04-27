const riderService = require('../services/riderService');

exports.createRider = async (req, res, next) => {
    try {
        const { name, isAvailable } = req.body;

        if (!name || !isAvailable) {
          return res.status(400).json({
            error: { message: "Missing required fields", status: 400 },
          });
        }

        const riderData = {
            name,
            isAvailable,
        };

        const newRider = await riderService.createRider(riderData);

        res.status(201).json(newRider);
    } catch (error) {
        next(error);
    }
}