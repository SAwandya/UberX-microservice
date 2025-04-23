const svcROc=require('../services/restaurantOrderService');
exports.list=async(req,res,next)=>{ try{ const arr=await svcROc.incoming(req.user.id); res.json({orders:arr}); }catch(e){next(e);} };
