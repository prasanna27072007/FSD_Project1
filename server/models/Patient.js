import mongoose from 'mongoose';
const schema=new mongoose.Schema({mrn:{type:String,unique:true,required:true},name:{type:String,required:true},age:Number,gender:{type:String,enum:['Male','Female','Other']},admissionDate:Date,condition:String,risk:{type:String,enum:['Low','Medium','High','Critical'],default:'Low'},allergies:[String],history:[String],symptoms:[String],medications:[String]},{timestamps:true});
export default mongoose.model('Patient',schema);
