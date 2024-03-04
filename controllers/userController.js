
const session = require('express-session')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Cart = require('../models/cartModel')


const User = require('../models/userModel')
const nodemailer = require('nodemailer')





const loadHome = async (req, res) => {
    try {
        let userId = req.session.user;
        
        console.log(userId, "user");
        let search = req.query.query || ""; 

        const productData = await Product.aggregate([
            {$match: { 
                    is_Active: true,
                    Bookname: { $regex: new RegExp(search, "i") } }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'Categories',
                    foreignField: '_id',
                    as: 'Categories'}
            },
            {
                $unwind: '$Categories'
            },
            {
                $match: { 'Categories.is_Active': true }
            }
        ]);

        const userData = await User.findOne({ _id: userId });
        // console.log('product data ', productData);
        res.render('home', { product: productData, name: userData.name, search: search });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};




const loadLogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log(error)

    }
}


const loadlogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error)

    }
}

const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const userData = await User.findOne({ email: email })
        if (userData) {
            if (password === userData.password) {
                if (userData.is_active == true) {

                    if (userData.is_admin === true) {
                        req.session.admin = userData._id;
                        console.log("hai0000000");
                        res.redirect("/admin/dashboard");
                    } else {
                        req.session.user = userData._id;

                        res.redirect("/home");
                    }
                } else {
                    res.render("login", { bannedMessage: "user banned" });

                }
            } else {
                res.render("login", { errmessage: "." });
            }
        }

    } catch (error) {
        console.log(error)
    }
}


const signup = async (req, res) => {
    try {

        res.render('registeration')

    } catch (error) {
        console.log(error)

    }
}


const verifySignup = async (req, res) => {
    try {

        console.log("hai");
        const matchEmail = await User.findOne({ email: req.body.email })
        if (matchEmail) {
            // toastr.error('Email already exists', 'Error')
            return res.redirect('/signup')
        }
        if (req.body.password == req.body.cpassword) {

            const datafromRegister = {

                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                mobile: req.body.mobile
            }
            // console.log(datafromRegister)

            req.session.data = datafromRegister

            // console.log("session Data:", req.session.data)
            //    res.render('otp')
            res.redirect("/getOtp")

        }


    } catch (error) {

        console.log(error)
    }
}





const getOtp = async (req, res) => {



    try {

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'joelfrancis422@gmail.com',

                pass: 'apqo dnri yzpa gvcg'
            }
        });


        // ************generating otp************

        let randomotp = Math.floor(1000 + Math.random() * 9000).toString()

        req.session.otp = randomotp

        const { email, name } = req.session.data


        const mailOptions = {
            from: 'joelfrancis422@gmail.com',
            to: email,
            subject: `Hello ${name}`,
            text: `Your verification OTP is ${randomotp}`

        };
        console.log(randomotp)

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email: ' + error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        res.render("otp")
    } catch (error) {
        console.log(error)
    }
}



const verifyOtp = async (req, res) => {
    try {
        // const otp = req.body.otp     changed code
        if (req.session.otp === req.body.otp) {
            const { email, name, mobile, password } = req.session.data
            const user = new User({
                name: name,
                email: email,
                mobile: mobile,
                password: password


            })

            const userData = await user.save()

            if (userData) {
                req.session.user = userData._id;

                res.redirect("/home")
                // res.rend("login", { successMessage: " Registered Succesfully !!" });
            }
        } else {
            res.render("registeration", { errmessage: "." })
        }


    } catch (error) {
        console.log(error)
    }
}


const shopProduct = async (req, res) => {
    try {
        let productId = req.query.id
        let userId = req.session.user;
        const productData = await Product.findOne({ _id: productId }).populate('Categories');
        const userData = await User.findOne({ _id: userId });
        res.render('singleproduct', { product: productData ,name:userData.name})

    } catch (error) {
        console.log(error)

    }
}


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






const loadShop = async (req, res) => {
    try {
        const categories = await Category.find();
        const userId = req.session.user;
        const search = req.query.query || ""; 

        const userData = await User.findOne({ _id: userId });
        const regex = new RegExp(search, 'i');

       if(req.query.filter){
        let products
       if(req.query.filter == 'low-high'){
            products = await Product.find({is_Active:true}).sort({ saleprice: 1 });
       } else if(req.query.filter == 'high-low'){
         products = await Product.find({is_Active:true}).sort({ saleprice: -1 });

       }
       res.render('shop', { product: products, categories, name: userData.name ,search: search});
       } else {
        const products = await Product.aggregate([
            {$match: { 
                    is_Active: true,
                    Bookname: { $regex: new RegExp(search, "i") } }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'Categories',
                    foreignField: '_id',
                    as: 'Categories'}
            },
            {
                $unwind: '$Categories'
            },
            {
                $match: { 'Categories.is_Active': true }
            }
        ]);

        res.render('shop', { product: products, categories, name: userData.name ,search: search});
       }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    } 
}


const loadProfile = async (req,res)=>{
    try{
        let userId = req.session.user;
        const userData = await User.findOne({ _id: userId });
        res.render('account',{name:userData.name})
}catch(error){
    console.log(error)    
}
}


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







// function generateOrderId(length) {
//     const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//     const orderIdLength = length - 3; 
//     let orderId = 'ORD';

//     for (let i = 0; i < orderIdLength; i++) {
//         const randomIndex = Math.floor(Math.random() * characters.length);
//         orderId += characters[randomIndex];
//     }

//     return orderId;
// }

// const orderId = generateOrderId(10);
// console.log(orderId);


module.exports = {
    loadHome,
    loadLogout,
    loadlogin,
    signup,
    verifySignup,
    getOtp,
    verifyOtp,
    verifyLogin,
    shopProduct,
    addToCart,
    loadShop,
    getCart,
    updateCart,
    removeItem,
    loadProfile,
    loadCheckOut,
    isCartEmpty,
    placeOrder
}







