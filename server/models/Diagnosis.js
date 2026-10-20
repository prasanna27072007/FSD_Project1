import mongoose from 'mongoose';
const schema=new mongoose.Schema({patient:{type:mongoose.Schema.Types.ObjectId,ref:'Patient'},suggestions:[{name:String,confidence:Number,reasoning:[String]}],createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}},{timestamps:true});
export default mongoose.model('Diagnosis',schema);
