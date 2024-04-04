
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Address = require('../models/addressModel')
const Wallet = require('../models/walletModel')
const Cart = require('../models/cartModel')
const Orders = require('../models/orderModel')
const Wishlist = require('../models/wishlistModel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')
const Coupon = require('../models/couponModel')





const loadGuest = async (req, res) => {
    try {
        let search = req.query.query || "";
        const productData = await Product.aggregate([
            {
                $match: {
                    is_Active: true,
                    Bookname: { $regex: new RegExp(search, "i") },
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'Categories',
                    foreignField: '_id',
                    as: 'Categories'
                }
            },
            {
                $unwind: '$Categories'
            },
            {
                $match: { 'Categories.is_Active': true }
            },
            {
                $lookup: {
                    from: 'subcategories',
                    localField: 'subCategories',
                    foreignField: '_id',
                    as: 'subCategories'
                }
            },
            {
                $unwind: '$subCategories'
            },
            {
                $match: { 'subCategories.is_Active': true }
            }
        ]).limit(12)
        res.render('home', { name: null, search: null, product: productData, search: search }); 
    } catch (error) {
        console.error(error);
    }
}




const loadlogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.error(error)
    }
}


const loadHome = async (req, res) => {
    try {
        let search = req.query.query || "";
        let userId = req.session.user;
        
        const cartData = await Cart.findOne({ userId: userId });
        const wishlistData = await Wishlist.findOne({ userId: userId }).populate('product.productId');

        const cartLength = cartData ? cartData.product.length : 0;
        const wishlistLength = wishlistData ? wishlistData.product.length : 0;

        const productData = await Product.aggregate([
            {
                $match: {
                    is_Active: true,
                    Bookname: { $regex: new RegExp(search, "i") }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'Categories',
                    foreignField: '_id',
                    as: 'Categories'
                }
            },
            {
                $unwind: '$Categories'
            },
            {
                $match: { 'Categories.is_Active': true }
            },
            {
                $lookup: {
                    from: 'subcategories',
                    localField: 'subCategories',
                    foreignField: '_id',
                    as: 'subCategories'
                }
            },
            {
                $unwind: '$subCategories'
            },
            {
                $match: { 'subCategories.is_Active': true }
            }
        ]).limit(12);
        const userData = await User.findOne({ _id: userId });
        res.render('home', { product: productData, name: userData.name, search: search, cartLength, wishlistLength });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};



const loadLogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.error(error)
    }
}



const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_active == true) {
                    if (userData.is_admin === true) {
                        req.session.admin = userData._id;
                        res.redirect("/admin/dashboard");
                    } else {
                        req.session.user = userData._id;
                        res.redirect("/home");
                    }
                } else {
                    res.render("login", { bannedMessage: "User is banned" });
                }
            } else {
                res.render("login", { errmessage: "Incorrect email or password" });
            }
        } else {
            res.render("login", { errmessage: "User not found" });
        }
    } catch (error) {
        console.error(error);
    }
};



const signup = async (req, res) => {
    try {
        res.render('registeration', { emailExists: false })
    } catch (error) {
        console.error(error)
    }
}



const verifySignup = async (req, res) => {
    try {
        console.log("hai");
        const matchEmail = await User.findOne({ email: req.body.email })
        if (matchEmail) {
            return res.render('registeration', { emailExists: true });
        }
        if (req.body.password == req.body.cpassword) {
            const datafromRegister = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                mobile: req.body.mobile
            }
            req.session.data = datafromRegister
            res.redirect("/getOtp")
        }
    } catch (error) {
        console.error(error)
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
                          //otp_generation//
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
        console.error(error)
    }
}



const verifyOtp = async (req, res) => {
    try {
        if (req.session.otp === req.body.otp) {
            const { email, name, mobile, password } = req.session.data
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({
                name: name,
                email: email,
                mobile: mobile,
                password: hashedPassword
            })
            const userData = await user.save()
            if (userData) {
                req.session.user = userData._id;
                res.redirect("/home")
            }
        } else {
            res.render("registeration", { errmessage: "." })
        }
    } catch (error) {
        console.error(error)
    }
}



const shopProduct = async (req, res) => {
    try {
        let productId = req.query.id
        let userId = req.session.user;
        const productData = await Product.findOne({ _id: productId }).populate('Categories');
        const relatedProducts =await Product.find({Categories:productData.Categories , _id: { $ne: productId }}); //id
    
        const userData = await User.findOne({ _id: userId });
        const cartData= await Cart.findOne({userId:userId})
        const cartLength = cartData ? cartData.product.length : 0
        const wishlistData = await Wishlist.findOne({ userId: userId }).populate('product.productId')

        const wishlistLength = wishlistData ? wishlistData.product.length : 0

        res.render('singleproduct', { product: productData, name: userData.name,relatedProducts,cartLength,wishlistLength})
    } catch (error) {
        console.error(error)
        res.render('error',{error})
    }
}


const loadProfile = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.findOne({ _id: userId });
        const Order = await Orders.find({ userId: userId }).populate('userId');
        const addressData = await Address.find({ userId: userId });
        const coupons = await Coupon.find();
        let wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            wallet = new Wallet({ userId, balance: 0 });
            await wallet.save();
        }
        const cartData = await Cart.findOne({ userId: userId });
        const wishlistData = await Wishlist.findOne({ userId: userId }).populate('product.productId');

        const cartLength = cartData ? cartData.product.length : 0;
        const wishlistLength = wishlistData ? wishlistData.product.length : 0;

        res.render('account', { name: userData.name, email: userData.email, addresses: addressData, orders: Order, cartLength, coupons, wallet, wishlistLength });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
}



const loadOrderDetails = async (req,res)=>{
    try {
        const userId = req.session.user;
        const productID = req.query.id
        const orders = await Orders.findOne({ _id:productID}).populate('product.productId')
        const orderData = await Orders.findOne({ _id:productID})
        const userData = await User.findOne({ orderId: productID });
        const addressData = await Address.findOne({ userId : userId });
        const cartData= await Cart.findOne({userId:userId})
        const wishlistData = await Wishlist.findOne({ userId: userId }).populate('product.productId')

        const cartLength = cartData ? cartData.product.length : 0
        const wishlistLength = wishlistData ? wishlistData.product.length : 0

        res.render("ordersdetail",{orders,user:userData,address:addressData,cartData,cartLength:cartLength,orderData,wishlistLength})
    } catch (error) {
        console.error(error)  
    }
}



const loadInvoice =  async(req,res)=>{
    try{
        const userId = req.session.user;
        const productID = req.query.id
        const userData = await User.findOne({_id: userId });
        const orders = await Orders.findOne({ _id:productID}).populate('product.productId')
        const orderData = await Orders.findOne({ _id:productID})
        const addressData = await Address.findOne({ userId : userId });
        res.render("invoice",{orders,address:addressData,user:userData,orderData})
        }catch(error){
        console.error(error)
    }
}


const loadShop = async (req, res) => {
    try {
        const categories = await Category.find();
        const userId = req.session.user;
        const search = req.query.query || "";
        const userData = await User.findOne({ _id: userId });
        const regex = new RegExp(search, 'i');
        const cartData = await Cart.findOne({ userId: userId });
        const wishlistData = await Wishlist.findOne({ userId: userId }).populate('product.productId');
        const cartLength = cartData ? cartData.product.length : 0;
        const wishlistLength = wishlistData ? wishlistData.product.length : 0;

        if (req.query.filter) {
            let products;
            if (req.query.filter == 'low-high') {
                products = await Product.find({ is_Active: true }).sort({ saleprice: 1 });
            } else if (req.query.filter == 'high-low') {
                products = await Product.find({ is_Active: true }).sort({ saleprice: -1 });
            }
            res.render('shop', { product: products, categories, name: userData.name, search: search });
        } else {
            const products = await Product.aggregate([
                {
                    $match: {
                        is_Active: true,
                        Bookname: { $regex: new RegExp(search, "i") }
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'Categories',
                        foreignField: '_id',
                        as: 'Categories'
                    }
                },
                {
                    $unwind: '$Categories'
                },
                {
                    $match: { 'Categories.is_Active': true }
                },
                {
                    $lookup: {
                        from: 'subcategories',
                        localField: 'subCategories',
                        foreignField: '_id',
                        as: 'subCategories'
                    }
                },
                {
                    $unwind: '$subCategories'
                },
                {
                    $match: { 'subCategories.is_Active': true }
                }
            ]);
            res.render('shop', { product: products, categories, name: userData.name, search: search, cartLength, wishlistLength });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}



const profileEdit = async (req, res) => {
    try {
        
        res.render("changePass")
    } catch (error) {
        console.error(error);
    }
}

const profileEdit2 = async (req, res) => {
    try {
        console.log("------------------------------------------------")
        const { password, npassword, cnpassword } = req.body;
        
        const userId = req.session.user;
        const user = await User.findOne({ _id: userId });
        
        if (!user) {
            console.error('User not found');
            res.redirect('/loadProfile');
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.json({ message: 'Current password is incorrect' });
        }
        const hashedPassword = await bcrypt.hash(npassword, 10); // 10 is the salt rounds
        const updated = await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
        if (updated) {
            console.log("Password updated successfully");
            return res.json({ success: true, message: 'Password updated successfully!' });
        } else {
            console.error('Failed to update password');
            return res.json({ success: false, message: 'Failed to update password' });
        }
    } catch (error) {
        console.error(error);
    }
}




const loadAddAddress = async (req, res) => {
    try {
        res.render('addAddress');
    } catch (error) {
        console.error(error);
    }
};






const addAddress = async (req, res) => {
    try {
        const userId = req.session.user
        const { name, mobile, houseName, city, state, pinCode } = req.body;
        const address = new Address({
            userId: userId,
            name: name,
            mobile: mobile,
            houseName: houseName,
            city: city,
            state: state,
            pinCode: pinCode
        });
        const savedAddress = await address.save();
        res.redirect('/loadProfile')
    } catch (error) {
        console.error(error);
    }
};



const addAddress1 = async (req, res) => {
    try {
        const userId = req.session.user
        const { name, mobile, houseName, city, state, pinCode } = req.body;
        const address = new Address({
            userId: userId,
            name: name,
            mobile: mobile,
            houseName: houseName,
            city: city,
            state: state,
            pinCode: pinCode
        });
        const savedAddress = await address.save();
        res.redirect('/loadCheckOut')
    } catch (error) {
        console.error(error);
    }
};




const loadEditAddress = async (req, res) => {
    try {
        const userId = req.session.user;
        const addressData = await Address.findById(req.query.id);
        res.render('editAddress', { addresses: addressData });
    } catch (error) {
        console.error(error);
    }
};



const loadEditAddress1 = async (req, res) => {
    try {
        const userId = req.session.user;
        const addressData = await Address.findById(req.query.id);
        res.render('editAddressProfile', { addresses: addressData });
    } catch (error) {
        console.error(error);
    }
};



const updateAddress = async (req, res) => {
    try {
        const { name, mobile, houseName, city, state, pinCode } = req.body;
        const userId = req.session.user;
        const updated = await Address.findByIdAndUpdate({ _id: req.query.id }, { $set: { name, mobile, houseName, city, state, pinCode } });
        res.redirect('/loadCheckOut');
    } catch (error) {
        console.error(error);
    }
};



const updateAddress1 = async (req, res) => {
    try {
        const { name, mobile, houseName, city, state, pinCode } = req.body;
        const userId = req.session.user;
        const updated = await Address.findByIdAndUpdate({ _id: req.query.id }, { $set: { name, mobile, houseName, city, state, pinCode } });
        res.redirect('/loadProfile');
    } catch (error) {
        console.error(error);
    }
};



const removeAddress = async (req, res) => {
    try {
        const { addressId } = req.body;
        const deletedAddress = await Address.findOneAndDelete({ _id: addressId });
        res.status(200).json({ message: 'Address removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' }); 
    }
};


const OrderCancelled = async (req, res) => {
    try {
        const orderId = req.query.id;
        const userId = req.session.user;
        const orderCancelled = await Orders.findByIdAndUpdate(orderId, { $set: { orderStatus: 'Cancelled' } });
        const wallet = await Wallet.findOne({ userId: userId });
        const cancelledOrder = await Orders.findById(orderId);
        if (cancelledOrder && wallet) {
            const totalAmount = parseFloat(cancelledOrder.totalAmount);
            wallet.balance += totalAmount;
            await wallet.save();
            res.redirect('/loadProfile');
        } else {
            throw new Error('Cancelled order or user wallet not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};




const orderReturn = async (req, res) => {
    try {
        const orderId = req.query.id;
        const userId = req.session.user;
        const orderReturned = await Orders.findByIdAndUpdate(orderId, { $set: { orderStatus: 'Returned' } });
        const wallet = await Wallet.findOne({ userId: userId });
        const returnedOrder = await Orders.findById( orderId );
        if (returnedOrder && wallet) {
            const totalAmount = parseFloat(returnedOrder.totalAmount);
            wallet.balance += totalAmount;
            await wallet.save();
            res.redirect('/loadProfile');
        } else {
            throw new Error('Returned order or user wallet not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}



const orderDetail = async (req, res) => {
    try {
        res.render('ordersdetail')
    } catch (error) {
        console.error(error)
    }
}



const categorySearch = async (req, res) => {
    try {
        const categories = await Category.find();
        const userId = req.session.user;
        const search = req.query.query || "";
        const userData = await User.findOne({ _id: userId });
        const regex = new RegExp(search, 'i');
        const category = req.query.category;
        let products;
        if (category) {
            const categoryObj = await Category.findOne({ categoryName: category });
            if (!categoryObj) {
                return res.status(404).send('Category not found');
            }
            products = await Product.find({ Categories: categoryObj._id, is_Active: true }).populate('Categories');
        } else {
            if (req.query.filter) {
                if (req.query.filter == 'low-high') {
                    products = await Product.find({ is_Active: true }).sort({ saleprice: 1 });
                } else if (req.query.filter == 'high-low') {
                    products = await Product.find({ is_Active: true }).sort({ saleprice: -1 });
                }
            } else {
                products = await Product.aggregate([
                    {
                        $match: {
                            is_Active: true,
                            Bookname: { $regex: new RegExp(search, "i") }
                        }
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'Categories',
                            foreignField: '_id',
                            as: 'Categories'
                        }
                    },
                    {
                        $unwind: '$Categories'
                    },
                    {
                        $match: { 'Categories.is_Active': true }
                    }
                ]);
            }
        }
        res.render('shop', { product: products, categories, name: userData.name, search: search });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}


const addTowallet = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.session.user;
        let wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            wallet = new Wallet({ userId, balance: amount });
        } else {
            wallet.balance += parseFloat(amount);
        }
        await wallet.save();
        console.log(amount, "amount added to wallet");
        res.redirect('/loadProfile');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};





const getWishlist = async (req,res)=>{
    try{
        const userId = req.session.user
        const userData = await User.findOne({ _id: userId });
        let product = await Product.findOne({userId})

        const wishlistData = await Wishlist.findOne({ userId: userId }).populate('product.productId')
        const wishlistLength = wishlistData ? wishlistData.product.length : 0
        res.render("wishlist",{wishlistData,name:userData.name,wishlistLength})
    }catch(error){
        console.error(error)
    }
}



const wishlist = async (req, res) => {
    try {
        const productId = req.query.id; 
        const userId = req.session.user;
        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            wishlist = new Wishlist({ userId, product: [] });
        }
        const existingProductIndex = wishlist.product.findIndex(item => item.productId.toString() === productId);
        if (existingProductIndex !== -1) {
            wishlist.product[existingProductIndex].quantity += 1;
        } else {
            wishlist.product.push({ productId, quantity: 1 });
        }
        await wishlist.save();
        res.redirect('/getWishlist');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    
    }
};


const removeWish = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user;
        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            console.log("wishlist not found")
        }
        const productIndex = wishlist.product.findIndex(item => item.productId.toString() === productId);
        if (productIndex !== -1) {
            wishlist.product.splice(productIndex, 1);
            const updateCart = await wishlist.save();
            return res.status(200).send('Product removed from the wishlist');
        } else {
            return res.status(404).send('Product not found in the wishlist');
        }
    } catch (error) {
        console.error(error.message);
    }
};


const orderSuccess = async(req,res)=>{
    try{
res.render("orderSuccess")
    }catch(error){
        console.error(error)
    }
}

module.exports = {
    loadGuest,
    loadHome,
    loadLogout,
    loadlogin,
    signup,
    verifySignup,
    getOtp,
    verifyOtp,
    verifyLogin,
    shopProduct,
    loadProfile,
    loadShop,
    profileEdit,
    profileEdit2,
    
    addAddress,
    addAddress1,
    loadEditAddress,
    loadEditAddress1,
    updateAddress,
    updateAddress1,
    removeAddress,
    loadAddAddress,
    OrderCancelled,
    orderReturn,
    orderDetail,
    categorySearch,
    loadOrderDetails,
    loadInvoice,
    addTowallet,
    getWishlist,
    wishlist,
    removeWish,
    orderSuccess

}
