const mongoose = require('mongoose')
const {Schema} = mongoose;

const walletSchema=mongoose.Schema({
    userId:{ type:Schema.Types.ObjectId,required:true},
    balance:{type:Number,default:0}

})


module.exports = mongoose.model('Wallet',walletSchema);
