const svc=require('../services/restaurantService');
exports.register=async(req,res,next)=>{ try{ const r=await svc.register(req.user.id,req.body); res.status(201).json({restaurant:r}); }catch(e){next(e);} };
exports.getMine=async(req,res,next)=>{ try{ const r=await svc.getMine(req.user.id); if(!r) return res.status(404).end(); res.json({restaurant:r}); }catch(e){next(e);} };
exports.approve=async(req,res,next)=>{ try{ const r=await svc.approve(req.params.id); res.json({restaurant:r}); }catch(e){next(e);} };
exports.update=async(req,res,next)=>{ try{ const r=await svc.update(req.params.id,req.body); res.json({restaurant:r}); }catch(e){next(e);} };
exports.delete=async(req,res,next)=>{ try{ await svc.delete(req.params.id); res.status(204).end(); }catch(e){next(e);} };
