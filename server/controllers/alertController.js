import Alert from '../models/Alert.js';
export async function list(req,res){res.json(await Alert.find().populate('patient','name mrn').sort({createdAt:-1}).limit(100));}
export async function acknowledge(req,res){const a=await Alert.findByIdAndUpdate(req.params.id,{acknowledged:true},{new:true}).populate('patient','name mrn'); req.io.emit('alert:update',a); res.json(a);}
export async function escalate(req,res){const a=await Alert.findByIdAndUpdate(req.params.id,{escalated:true,priority:'Critical'},{new:true}).populate('patient','name mrn'); req.io.emit('alert:update',a); res.json(a);}
