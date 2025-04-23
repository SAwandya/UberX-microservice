const svcWD=require('../services/workDayService');
exports.list=async(req,res,next)=>{ try{ const d=await svcWD.list(); res.json({workDays:d}); }catch(e){next(e);} };
