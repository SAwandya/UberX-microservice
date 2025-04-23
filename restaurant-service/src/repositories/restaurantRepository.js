const pool = require('../config/database');
const Restaurant = require('../models/Restaurant');
const { RESTAURANT_STATUS } = require('../utils/constants');
exports.create = async ({ ownerId, name, address, images }) => {
  const [res] = await pool.execute(
    `INSERT INTO restaurants (ownerId,name,address,images,status) VALUES (?,?,?,?,?)`,
    [ownerId,name,address,images,RESTAURANT_STATUS.PENDING]
  );
  return new Restaurant(res.insertId, ownerId,name,address,images,false,RESTAURANT_STATUS.PENDING);
};
exports.findById = async (id) => { const [r] = await pool.execute(`SELECT * FROM restaurants WHERE id=?`,[id]); if(!r.length) return null; const x=r[0]; return new Restaurant(x.id,x.ownerId,x.name,x.address,x.images,!!x.isAvailable,x.status); };
exports.findByOwner = async(ownerId)=>{ const [r]=await pool.execute(`SELECT * FROM restaurants WHERE ownerId=?`,[ownerId]); if(!r.length) return null; const x=r[0]; return new Restaurant(x.id,x.ownerId,x.name,x.address,x.images,!!x.isAvailable,x.status); };
exports.updateStatus = async(id,status)=>{ await pool.execute(`UPDATE restaurants SET status=? WHERE id=?`,[status,id]); return exports.findById(id); };
exports.update = async(id,data)=>{ const f=[],v=[]; ['name','address','images','isAvailable'].forEach(k=>{ if(data[k]!==undefined){ f.push(`${k}=?`); v.push(data[k]); }}); if(!f.length) return exports.findById(id); v.push(id); await pool.execute(`UPDATE restaurants SET ${f.join(',')} WHERE id=?`,v); return exports.findById(id); };
exports.delete = async(id)=>{ await pool.execute(`DELETE FROM restaurants WHERE id=?`,[id]); };