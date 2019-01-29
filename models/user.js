
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

 let userSchema = new Schema({
    username: { type:String, required:true, unique:true},
    email: { type:String},
    password:{ type:String, required:true}

 });


 let userModel=mongoose.model('userModel',userSchema);
 module.exports=userModel;
