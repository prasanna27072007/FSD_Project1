import mongoose from 'mongoose';
const schema=new mongoose.Schema({patient:{type:mongoose.Schema.Types.ObjectId,ref:'Patient'},title:String,message:String,priority:{type:String,enum:['Critical','Warning','Info'],default:'Info'},acknowledged:{type:Boolean,default:false},escalated:{type:Boolean,default:false}},{timestamps:true});
export default mongoose.model('Alert',schema);
