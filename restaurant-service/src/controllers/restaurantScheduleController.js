const svcRS=require('../services/restaurantScheduleService');
exports.add=async(req,res,next)=>{ try{ const rec=await svcRS.add({rid:req.user.id, wd:req.body.workDayId, wh:req.body.workHoursId}); res.status(201).json({schedule:rec});}catch(e){next(e);} };
exports.getMine=async(req,res,next)=>{ try{ const arr=await svcRS.getFor(req.user.id); res.json({schedule:arr}); }catch(e){next(e);} };
