import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:String,genericName:String,className:String,allergens:[String],interactions:[String]});
export default mongoose.model('Medication',schema);
