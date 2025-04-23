const poolRO=require('../config/database'); const RestaurantOrder=require('../models/RestaurantOrder');
exports.createFromEvent=async(evt)=>{ const {order,order:{id:oid,customerId,restaurantId,items,deliveryFee,status,createdAt}}=evt; const [r]=await poolRO.execute(
  `INSERT INTO restaurant_orders (orderId,customerId,restaurantId,items,deliveryFee,status,createdAt) VALUES (?,?,?,?,?,?,?)`,
  [oid,customerId,restaurantId,JSON.stringify(items),deliveryFee,status,createdAt]
); return new RestaurantOrder(r.insertId,oid,customerId,restaurantId,items,deliveryFee,status,createdAt);
};
exports.findByRestaurant=async(rid)=>{ const [rows]=await poolRO.execute(`SELECT * FROM restaurant_orders WHERE restaurantId=? ORDER BY createdAt DESC`,[rid]); return rows.map(r=>new RestaurantOrder(r.id,r.orderId,r.customerId,r.restaurantId,JSON.parse(r.items),r.deliveryFee,r.status,r.createdAt)); };
