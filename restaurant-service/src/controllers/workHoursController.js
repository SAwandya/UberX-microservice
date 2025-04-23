const svcWH=require('../services/workHoursService');
exports.list=async(req,res,next)=>{ try{ const d=await svcWH.list(); res.json({workHours:d}); }catch(e){next(e);} };