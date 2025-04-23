const natsMgr=require('../../utils/natsConnectionManager'); const svcRO=require('../../services/restaurantOrderService');
(async()=>{ await natsMgr.subscribe('orders.created', async(evt)=>{ try{ await svcRO.fromEvent(evt); console.log('Saved incoming order',evt.order.id);}catch(e){console.error(e);} }); })();
