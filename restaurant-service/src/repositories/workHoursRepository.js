const poolWH=require('../config/database'); const WorkHours=require('../models/WorkHours');
exports.findAll=async()=>{ const [rows]=await poolWH.execute(`SELECT * FROM work_hours`); return rows.map(r=>new WorkHours(r.id,r.startTime,r.endTime)); };
