const mongoose = require('mongoose')
const OrderSchema=mongoose.Schema({

    

    userId:{type:mongoose.Schema.ObjectId,ref:'User'},
    product:[{productId:{type:mongoose.Schema.ObjectId,
    ref:"Product"},
    quantity:{type:Number}}
    ],
    
    address:{
        firstName:{type:String,required:true},
        lastName:{type:String,required:true},
        address:{type:String,required:true},
        city:{type:String,required:true},
        state:{type:String,required:true},
        zipcode:{type:Number,required:true},
        mobile:{type:Number,required:true},
    },

    orderId:{type:String},
    orderDate:{type:Date,default:Date.now}

})


module.exports = mongoose.model('Orders',OrderSchema);


