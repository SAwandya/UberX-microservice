const r= require('express').Router(); const c=require('../controllers/restaurantController'); const {authenticate,authorizeRole}=require('../middlewares/authMiddleware');
r.post('/',authenticate,authorizeRole('RestaurantAdmin'),c.register);
r.get('/me',authenticate,authorizeRole('RestaurantAdmin'),c.getMine);
r.put('/:id/approve',authenticate,authorizeRole('SystemAdmin'),c.approve);
r.put('/:id',authenticate,authorizeRole('RestaurantAdmin'),c.update);
r.delete('/:id',authenticate,authorizeRole('RestaurantAdmin'),c.delete);
module.exports=r;