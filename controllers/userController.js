
const session = require('express-session')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Cart = require('../models/cartModel')


const User = require('../models/userModel')
const nodemailer = require('nodemailer')





const loadHome = async (req, res) => {
    try {
        let userId = req.session.user;
        
        console.log(userId, "user");w
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
                res.render("login", { successMessage: "." })
                res.redirect("/login")
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
        const userId = req.session.user; // Assuming userId is stored in the session
        // Check if the user is logged in
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        // Find the cart for the user or create a new one if it doesn't exist
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, product: [] });
        }

        // Check if the product already exists in the cart
        const existingProductIndex = cart.product.findIndex(item => item.productId.toString() === productId);

        if (existingProductIndex !== -1) {
            // If the product already exists, increase the quantity
            cart.product[existingProductIndex].quantity += 1;
        } else {
            // If the product doesn't exist, add it to the cart
            cart.product.push({ productId, quantity: 1 });
        }

        // Save the cart
        await cart.save();

        // Redirect or respond with a success message as needed
        res.redirect('/cart'); // Redirect to cart page
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
        const  userId  = req.session.user; // Assuming you're using sessions for authentication
        // Find the cart for the current user
        let cart = await Cart.findOne({ userId });
        // console.log(cart,"this is cart")

        if (!cart) {
            // If the cart doesn't exist for the user, you might want to create a new one
            cart = new Cart({ userId, product: [] });
        }

        // Find the index of the product in the cart
        const productIndex = cart.product.findIndex(item => item.productId.toString() === productId);
        console.log(req.body,"this is productId--_")
        console.log(productId,"this is productId--_")
        console.log(quantity,"this is quantity-")
        if (productIndex !== -1) {
            // If the product is already in the cart, update its quantity
            if (quantity > 0) {
                // Increase quantity
                cart.product[productIndex].quantity += quantity;
            } else if (quantity < 0 && cart.product[productIndex].quantity + quantity > 0) {
                // Decrease quantity only if it won't go below zero
                cart.product[productIndex].quantity += quantity;
            } else {
                // If quantity becomes zero or negative, remove the product from the cart
                cart.product.splice(productIndex, 1);
            }
        } else if (quantity > 0) {
            // If the product is not in the cart and quantity is positive, add it to the cart
            cart.product.push({ productId, quantity });
            console.log(quantity,"quantity")
        }

        // Save the updated cart
        await cart.save();
        const quantityData  = {

            quantity:quantity
        }
        res.status(200).json({ quantityData }); // Sending a success status code
    } catch (error) {
        console.log(error.message);
        res.sendStatus(500); // Sending an internal server error status code
    }
}


const loadShop = async (req,res)=>{
    try{
        const categories = await Category.find();
        let userId = req.session.user;
        const userData = await User.findOne({ _id: userId });
        // const productD = await Product.findOne({ _id: productId }).populate('Categories');
        const products = await Product.find().populate('Categories');
        res.render('shop', { product: products,categories:categories,name:userData.name })
        // res.render("shop")
    }catch(error){
        console.log(error)
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
const loadCheckOut = async(req,res)=>{
    try{
        let userId = req.session.user;
        const userData = await User.findOne({ _id: userId });
        res.render('checkout',{name:userData.name})
    }catch(error){
        console.log(error)
    }
}


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
    loadProfile,
    loadCheckOut
}







