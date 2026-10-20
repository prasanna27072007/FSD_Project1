import mongoose from 'mongoose';
const schema=new mongoose.Schema({patient:{type:mongoose.Schema.Types.ObjectId,ref:'Patient',required:true},heartRate:Number,systolic:Number,diastolic:Number,spo2:Number,temperature:Number,recordedAt:{type:Date,default:Date.now}});
export default mongoose.model('Vitals',schema);
