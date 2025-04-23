const poolWD=require('../config/database'); const WorkDay=require('../models/WorkDay');
exports.findAll=async()=>{ const [rows]=await poolWD.execute(`SELECT * FROM work_day`); return rows.map(r=>new WorkDay(r.id,r.day)); };
