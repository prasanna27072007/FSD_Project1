import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true},email:{type:String,unique:true,required:true,lowercase:true},password:{type:String,required:true},role:{type:String,enum:['Doctor','Nurse','Admin'],default:'Doctor'},avatar:String},{timestamps:true});
export default mongoose.model('User',schema);
