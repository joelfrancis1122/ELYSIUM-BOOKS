const mongoose = require('mongoose')
const userSchema=mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    mobile:{type:String,required:true},
    password:{type:String,required:true},
    is_admin:{type:Boolean,required:false,default:false},
    is_active:{type:Boolean,required:false,default:true},
})


module.exports = mongoose.model('User',userSchema);


