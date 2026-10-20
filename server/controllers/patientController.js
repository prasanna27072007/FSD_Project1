import Patient from '../models/Patient.js';
export async function list(req,res){const q=req.query.q||''; const filter=q?{$or:[{name:{$regex:q,$options:'i'}},{mrn:{$regex:q,$options:'i'}},{condition:{$regex:q,$options:'i'}}]}:{}; res.json(await Patient.find(filter).sort({createdAt:-1}));}
export async function get(req,res){const p=await Patient.findById(req.params.id); if(!p)return res.status(404).json({message:'Patient not found'}); res.json(p);}
export async function create(req,res){res.status(201).json(await Patient.create(req.body));}
