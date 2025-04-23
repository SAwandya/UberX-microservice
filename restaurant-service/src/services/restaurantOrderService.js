const repoRO=require('../repositories/restaurantOrderRepository'); exports.fromEvent=(evt)=>repoRO.createFromEvent(evt); exports.incoming=(rid)=>repoRO.findByRestaurant(rid);
