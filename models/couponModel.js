const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    name: {type: String,required: true,unique: true},
    code: {type: String,required: true,unique: true},
    minimumPurchase: {type: Number},
    discountAmount: {type: Number,required: true},
    limit: { type: Number, required:true}, 
    redeemedUsers:[{ type: mongoose.Schema.Types.ObjectId}],
    expirationDate: { type: Date,require:true },
    isActive: {type: Boolean,default:true },
    isDeleted: { type: Boolean, default:false },
    Date: { type: Date, default: Date.now}
});

module.exports = mongoose.model('Coupon', couponSchema);