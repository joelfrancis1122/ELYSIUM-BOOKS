const User = require('../models/userModel')
const Cart = require('../models/cartModel')




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
        const cartData= await Cart.findOne({userId:userId}).populate('product.productId')
        res.render('checkout',{name:userData.name,cartData})
    }catch(error){
        console.log(error)
    }
}                                                                                               



const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user; 
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            console.log("Cart not found")
        }
        cart.product = [];
        await cart.save();
        // const ord = new ord({
        //    })
        res.redirect('/home');
    } catch (error) {
        console.error(error);
    }
};











module.exports = {

    getCart,
    addToCart,
    updateCart,
    removeItem,
    isCartEmpty,
    loadCheckOut,
    placeOrder
}

