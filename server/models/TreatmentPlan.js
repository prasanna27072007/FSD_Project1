import mongoose from 'mongoose';
const schema=new mongoose.Schema({patient:{type:mongoose.Schema.Types.ObjectId,ref:'Patient'},title:String,items:[{name:String,dose:String,frequency:String,evidence:String}],status:{type:String,default:'Draft'}},{timestamps:true});
export default mongoose.model('TreatmentPlan',schema);
