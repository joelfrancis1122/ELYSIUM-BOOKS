
// const { ObjectId } = require('mongodb')
const mongoose=require('mongoose')

const addressSchema= mongoose.Schema({

    userId:{type:mongoose.Schema.ObjectId,ref:"User"},
    first_name:{type:String,required:true},
    last_name:{type:String,required:true},
    address:{type:String,required:true},
    city:{type:String,required:true},
    state:{type:String,required:true},
    zipcode:{type:Number,required:true},
    mobile:{type:Number,required:true}





})

module.exports=mongoose.model("Address",addressSchema)