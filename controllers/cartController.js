const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Product = require('../models/productModel')

const Coupon = require('../models/couponModel')
const Address = require('../models/addressModel')
const Orders = require('../models/orderModel')
const Razorpay = require('razorpay');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

let instance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

const onlinePay = async (req, res) => {
  try {
    const { amount, address } = req.body;
    console.log(amount)
    const userId = req.session.user
    const cart = await Cart.findOne({ userId: userId });

    // const address = await Address.findOne({ _id: req.body.address });

    function generateOrderId() {
        const timestamp = Date.now().toString();
        const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let orderId = 'ORD';
        while (orderId.length < 6) {
            const randomIndex = Math.floor(Math.random() * randomChars.length);
            orderId += randomChars.charAt(randomIndex);
        }
        return orderId + timestamp.slice(-6);
    }

    const newOrderId = generateOrderId();

    const order = new Orders({
        orderId: newOrderId,
        userId: userId,
        paymentMethod: req.body.paymentMethod,
        totalAmount: req.body.amount,
        product: cart.product,
        address: address
    });

        await order.save()

    
    
    let amounts = amount*84
    const order2 = await instance.orders.create({
        amount: amounts*100,
        currency: "INR",
        receipt: req.session.user,
        })
        res.json({order2})
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};



const getCart = async (req, res) => {
    try {
        const userId = req.session.user
        const userData = await User.findOne({ _id: userId });
        const cartData = await Cart.findOne({ userId: userId }).populate('product.productId')
        const cartLength = cartData ? cartData.product.length : 0
        res.render("cart", { cartData, name: userData.name, cartLength })
    } catch (error) {
        console.log(error.message)
    }
}



const addToCart = async (req, res) => {
    try {
        const productId = req.query.id;
        const userId = req.session.user;
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, product: [] });
        }
        const existingProductIndex = cart.product.findIndex(item => item.productId.toString() === productId);
        if (existingProductIndex !== -1) {
            cart.product[existingProductIndex].quantity += 1;
        } else {
            cart.product.push({ productId, quantity: 1 });
        }
        await cart.save();
        res.redirect('/cart');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};



const updateCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.session.user;
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, product: [] });
        }
        const productIndex = cart.product.findIndex(item => item.productId.toString() === productId);
        if (productIndex !== -1) {
            if (quantity > 0) {
                cart.product[productIndex].quantity += quantity;
            } else if (quantity < 0 && cart.product[productIndex].quantity + quantity > 0) {
                cart.product[productIndex].quantity += quantity;
            } else {
                cart.product.splice(productIndex, 1);
            }
        } else if (quantity > 0) {
            cart.product.push({ productId, quantity });
        }
        await cart.save();
        const quantityData = {
            quantity: quantity
        }
        res.status(200).json({ quantityData });
    } catch (error) {
        console.log(error.message);
    }
}



const removeItem = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user;
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            console.log("cart not found")
        }
        const productIndex = cart.product.findIndex(item => item.productId.toString() === productId);
        if (productIndex !== -1) {
            cart.product.splice(productIndex, 1);
            const updateCart = await cart.save();
            return res.status(200).send('Product removed from the cart');
        } else {
            return res.status(404).send('Product not found in the cart');
        }
    } catch (error) {
        console.error(error.message);
    }
};



const isCartEmpty = async (req, res, next) => {
    try {
        const userId = req.session.user;
        const cart = await Cart.findOne({ userId });
        if (!cart || cart.product.length === 0) {
            res.redirect('/home')
        } else {
            next()
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



const loadCheckOut = async (req, res) => {
    try {
        let userId = req.session.user;
        const cart = await Cart.findOne({ userId });
        const userData = await User.findOne({ _id: userId });
        const addressData = await Address.find({ userId: userId });
        const cartData = await Cart.findOne({ userId: userId }).populate('product.productId')
        const cartLength = cartData ? cartData.product.length : 0
        res.render('checkout', { name: userData.name, cartData, addresses: addressData, cartLength })
    } catch (error) {
        console.log(error)
    }
}



const placeOrder = async (req, res) => {
    try {
        console.log("inside placeorder=++++++++++++++++++++")
        const userId = req.session.user
        const cart = await Cart.findOne({ userId: userId });
        const address = await Address.findOne({ _id: req.body.address });
        function generateOrderId() {
            const timestamp = Date.now().toString();
            const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let orderId = 'ORD';
            while (orderId.length < 6) {
                const randomIndex = Math.floor(Math.random() * randomChars.length);
                orderId += randomChars.charAt(randomIndex);
            }
            return orderId + timestamp.slice(-6);
        }


        const newOrderId = generateOrderId();


        const orderItems = cart.product;

        // Update product stock for each item in the order
        for (const item of orderItems) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock -= item.quantity; // Subtract order quantity from product stock
                await product.save();
            }
        }
        const order = new Orders({
            orderId: newOrderId,
            userId: userId,
            paymentMethod: req.body.paymentMethod,
            totalAmount: req.body.amount,
            product: cart.product,
            address: address
        });

        
        await order.save()
        res.status(200).json({ message: "Order Placed Successfully" })
    } catch (error) {
        console.error(error);
    }
};


const addCoupon = async (req, res) => {
    try {
        const { couponName, couponCode, minimumPurchase, discountAmount, expirationDate } = req.body;
            console.log("exsisting COupon:",req.body)
        // Check if the coupon name already exists in the database
        const existingCoupon = await Coupon.findOne({ couponCode: couponCode });
        const couponData = await Coupon.find().sort({ Date: -1 })
        if (existingCoupon) {
            return res.render('Coupon', { couponExists: true ,couponData}); 
        
        }

        // If the coupon name is unique, proceed to save the coupon
        const coupon = new Coupon({
            couponName: couponName,
            couponCode: couponCode,
            minimumPurchase: minimumPurchase,
            discountAmount: discountAmount,
            // maximumUses: maximumUses,
            expirationDate: expirationDate
        });

        // Save the coupon to the database
        const savedCoupon = await coupon.save();

        if (savedCoupon) {
            return res.redirect('/admin/loadCoupon');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};



const ToggleblockCoupon = async (req, res) => {
    try {
        const Couid = req.query.Couid
        const coupons = await Coupon.findOne({ _id: Couid });
        coupons.isActive = !coupons.isActive
        await coupons.save()
        res.redirect('/admin/loadCoupon')
    } catch (error) {
        console.log(error.message)
    }
}
const removeCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body; // Assuming the coupon code is passed in the request body
        const userId = req.session.user; // Assuming you have the user's ID in the session
        console.log(userId,"userID")
        console.log(couponCode,"Coupon")
        // Find the coupon document based on the coupon code
        const updatedCoupon = await Coupon.findOneAndUpdate(
            { couponCode: couponCode },
            { $pull: { redeemedUsers: { userId: userId } } }, // Pull the user ID from the redeemedUsers array
            { new: true } // To return the updated document
        );

        if (updatedCoupon) {
            console.log("Coupon updated successfully:", updatedCoupon);
            // Handle success if needed
        } else {
            console.log("Coupon not found or user not redeemed it:", couponCode);
            // Handle not found or user not redeemed the coupon
        }

        res.redirect('/admin/loadCoupon');
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}




const applyCoupon = async (req, res) => {
    try {
        const { couponCode,selectedAmount } = req.body;
        const userId = req.session.user;
        const coupon = await Coupon.findOne({ couponCode: couponCode, isActive: true , expirationDate: { $gte: Date.now() } });

        if (!coupon) {
            return res.json({
                success: false,
                message: 'Coupon not found or expired.'
            });
        }

        const userRedeemed = coupon.redeemedUsers.find(user => user.userId === userId);
        if (userRedeemed) {
            return res.json({
                success: false,
                message: 'Coupon has already been redeemed by the user.'
            });
        }
        if (selectedAmount < coupon.minimumPurchase) {
            return res.json({
                success: false,
                message: 'Selectected Coupon is not applicable for this price'
                
            });
        }

        coupon.redeemedUsers.push({ userId: userId, usedTime: new Date() });
        coupon.timesUsed++;
        await coupon.save();

        return res.status(200).json({
            success: true,
            message: 'Coupon applied successfully.',
            couponName: coupon.couponName,
            discountAmount: coupon.discountAmount
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

   




const clearCart = async (req, res) => {
    try {
        const userId = req.session.user;
        const cart = await Cart.findOne({ userId });
        cart.product = [];
        await cart.save();
        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'An error occurred while clearing the cart' });
    }
};




module.exports = {
    getCart,
    addToCart,
    updateCart,
    removeItem,
    isCartEmpty,
    loadCheckOut,
    placeOrder,
    addCoupon,
    ToggleblockCoupon,
    clearCart,
    applyCoupon,
    onlinePay,
    removeCoupon
}

