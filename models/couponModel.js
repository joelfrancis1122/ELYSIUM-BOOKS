const mongoose = require('mongoose');


const couponSchema = new mongoose.Schema({
    couponName: { type: String, required: true,unique:true},
    couponCode: { type: String, required: true,unique:true},
    minimumPurchase: { type: Number },
    discountAmount: { type: Number, required: true },
    maximumUses: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    Date: { type: Date, default: Date.now }
});



module.exports = mongoose.model('Coupon', couponSchema);
