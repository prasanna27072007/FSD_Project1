import {diagnose,chat} from '../services/aiService.js'; import Diagnosis from '../models/Diagnosis.js';
export async function runDiagnosis(req,res){const result=await diagnose(req.body); if(req.body.patientId)await Diagnosis.create({patient:req.body.patientId,suggestions:result.suggestions,createdBy:req.user.id}); res.json(result);}
export async function runChat(req,res){res.json(await chat(req.body.message||''));}
