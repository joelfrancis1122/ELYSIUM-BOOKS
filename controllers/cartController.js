const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Coupon = require('../models/couponModel')
const Address = require('../models/addressModel')
const Orders = require('../models/orderModel')




const getCart= async(req,res)=>{
    try {

        const userId= req.session.user
        const cartData= await Cart.findOne({userId:userId}).populate('product.productId')
        const userData = await User.findOne({ _id: userId });
        res.render("cart",{cartData,name:userData.name})
        
    } catch (error) {
        console.log(error.message)
        
    }
}


const addToCart = async (req, res) => {
    try {
        const productId = req.query.id;
        const userId = req.session.user; 
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

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
        console.log('Error adding product to cart:', error);
        res.status(500).send('Internal Server Error');
    }
};

const updateCart = async (req, res) => {
    try {
        console.log('update cart------------------')
        console.log("Product Id :",req.body)
        const  {productId, quantity}  = req.body;
        const  userId  = req.session.user; 
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, product: [] });
        }

        const productIndex = cart.product.findIndex(item => item.productId.toString() === productId);
        console.log(req.body,"this is productId--_")
        console.log(productId,"this is productId--_")
        console.log(quantity,"this is quantity-")
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
            console.log(quantity,"quantity")
        }

        await cart.save();
        const quantityData  = {

            quantity:quantity
        }
        res.status(200).json({ quantityData });
    } catch (error) {
        console.log(error.message);
        res.sendStatus(500); 
    }
}






const removeItem = async(req,res)=>{
    try {
        const {productId} = req.body;
        console.log(productId,"odiyan")
        const userId = req.session.user;
        let cart = await Cart.findOne({ userId });
        if (!cart) {
          console.log("cart not found")
        }   
        // Find the index of the product
        const productIndex = cart.product.findIndex(item => item.productId.toString() === productId);
console.log(productIndex,"product index kitty.............................")
        if (productIndex !== -1) {
            //  product   remove it
            cart.product.splice(productIndex, 1);
         const updateCart = await cart.save();
            console.log(updateCart,"after deleted odi")
            return res.status(200).send('Product removed from the cart');
        } else {
            console.log("Joel francis")
            return res.status(404).send('Product not found in the cart');
        }
    } catch (error) {
        console.error(error.message);
        // Send an error response
        res.status(500).send('Internal Server Error');
    }
};



const isCartEmpty = async (req, res, next) => {
    try {
        const userId = req.session.user; 
        const cart = await Cart.findOne({ userId });

        if (!cart || cart.product.length === 0) {
            res.redirect('/home')
        } else{
            next()
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



const loadCheckOut = async(req,res)=>{
    try{

        let userId = req.session.user;
        const cart = await Cart.findOne({ userId });
        const userData = await User.findOne({ _id: userId });
        const addressData = await Address.find({ userId : userId });
        console.log("*******************",addressData)
        const cartData= await Cart.findOne({userId:userId}).populate('product.productId')
        res.render('checkout',{name:userData.name,cartData, addresses: addressData })
    }catch(error){
        console.log(error)
    }
}                                                                                               



const placeOrder = async (req, res) => {
        try {

            const userId = req.session.user
            console.log("user from placeOrder: " , userId)
            const cart = await Cart.findOne({userId:userId});
            console.log("cart frm placeOrder : " , cart)
            const address = await Address.findOne({_id:req.body.addresss});
            console.log("address frm placeOrder : " , address)

            // const address = await Address.findById(addressId);
  
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


            // const { paymentMethod, totalAmount,orderStatus } = req.body;
            
            // // Create a new order object and save it to the database
            const order = new Orders({
                orderId: newOrderId,
                userId:userId,
                paymentMethod: req.body.paymentMethod,
                totalAmount: req.body.amount,
                product:cart.product,
                address:address
                // You can add other fields like user ID, order date, etc. if needed
            });
            await order.save()  
            console.log("newOrder:",order)
            res.status(200).json({message:"Order Placed Successfully"})
            // // Respond with success
            // res.status(200).json({ message: 'Order placed successfully' });
    } catch (error) {
        console.error(error);
    }
};




const addCoupon = async (req, res) => {
    try {
       
        const { couponName, couponCode, minimumPurchase , discountAmount , maximumUses, expirationDate} = req.body;
        // const couponData = await Coupon.find()

        console.log("gydfyiyh")
        console.log(req.body)
        const coupons = new Coupon({
            couponName: couponName,
            couponCode: couponCode,
            minimumPurchase :minimumPurchase ,
            discountAmount:discountAmount,
            maximumUses:maximumUses,
            expirationDate:expirationDate

        });
        console.log("Coupon :",coupons)

       let couponData =  await coupons.save();
       console.log("Sample coppn data : " , couponData)
       if(couponData){
        req.flash('success', 'This is a success message');
        res.redirect('/admin/loadCoupon')
       }

    } catch (error) {
        console.error(error);
    }
};


const ToggleblockCoupon = async(req,res)=>{
    try{
        const Couid = req.query.Couid
        console.log("................................",Couid)
        const coupons = await Coupon.findOne({_id:Couid});
        coupons.isActive=!coupons.isActive
        await coupons.save()
        res.redirect('/admin/loadCoupon')


    }catch(error){
        console.log(error.message)
    }
}




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






const orderCancel = async (req, res) => {
    try {
      
     
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
    orderCancel

}

