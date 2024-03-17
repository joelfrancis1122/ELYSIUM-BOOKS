
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Address = require('../models/addressModel')
const Cart = require('../models/cartModel')
const Orders = require('../models/orderModel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')





const loadGuest = async (req, res) => {
    try {

        let search = req.query.query || "";

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
            }
        ]);
        res.render('home', { name: null, search: null, product: productData, search: search }); // Passing name as null since no user is logged in

    } catch (error) {
        console.log(error);
    }
}


const loadlogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error)

    }
}




const loadHome = async (req, res) => {
    try {
        let userId = req.session.user;

        let search = req.query.query || "";
        const cartData= await Cart.findOne({userId:userId})
        const cartLength = cartData ? cartData.product.length : 0
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
            }
        ]);

        const userData = await User.findOne({ _id: userId });
        res.render('home', { product: productData, name: userData.name, search: search ,cartLength});
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




const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            console.log(password,"password--------------------")
            console.log(userData.password,"userdata+++++++++++++++++++")
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
        console.log(error);
    }
};


const signup = async (req, res) => {
    try {

        res.render('registeration', { emailExists: false })

    } catch (error) {
        console.log(error)

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
        if (req.session.otp === req.body.otp) {
            const { email, name, mobile, password } = req.session.data
            const hashedPassword = await bcrypt.hash(password, 10);

            console.log(hashedPassword, "hashed password confirmed !!!!!!!!!!!!!!")
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
        console.log(error)
    }
}



const shopProduct = async (req, res) => {
    try {
        let productId = req.query.id
        let userId = req.session.user;
        const productData = await Product.findOne({ _id: productId }).populate('Categories');
        const relatedProducts =await Product.find({Categories:productData.Categories , _id: { $ne: productId }}); //id
        console.log("relatedProducts",relatedProducts)
        const userData = await User.findOne({ _id: userId });
        const cartData= await Cart.findOne({userId:userId})

        const cartLength = cartData ? cartData.product.length : 0
        res.render('singleproduct', { product: productData, name: userData.name,relatedProducts,cartLength})

    } catch (error) {
        console.log(error)
    }
}

const loadProfile = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.findOne({ _id: userId });
        const Order = await Orders.find({ userId: userId }).populate('userId');
        const addressData = await Address.find({ userId: userId });
        const cartData= await Cart.findOne({userId:userId})

        const cartLength = cartData ? cartData.product.length : 0
        res.render('account', { name: userData.name, email: userData.email, addresses: addressData, orders: Order,cartLength });
    } catch (error) {
        console.log(error);
        res.redirect('/'); // Redirect to home or any other page in case of error
    }
}



const loadOrderDetails = async (req,res)=>{
    try {
        const userId = req.session.user;
        const productID = req.query.id
        const orders = await Orders.findOne({ _id:productID}).populate('product.productId')
        const userData = await User.findOne({ orderId: productID });
        const addressData = await Address.findOne({ userId : userId });
        const cartData= await Cart.findOne({userId:userId})
        const cartLength = cartData ? cartData.product.length : 0
        res.render("ordersdetail",{orders,user:userData,address:addressData,cartData,cartLength:cartLength})


    } catch (error) {
        console.log(error.message)  
    }
}


const loadInvoice =  async(req,res)=>{
    try{
        const userId = req.session.user;
        const productID = req.query.id
        const userData = await User.findOne({_id: userId });

        const orders = await Orders.findOne({ _id:productID}).populate('product.productId')
        const addressData = await Address.findOne({ userId : userId });

        res.render("invoice",{orders,address:addressData,user:userData})

        }catch(error){
        console.log(error)
    }
}

const loadShop = async (req, res) => {
    try {
        const categories = await Category.find();
        const userId = req.session.user;
        const search = req.query.query || "";

        const userData = await User.findOne({ _id: userId });
        const regex = new RegExp(search, 'i');
        const cartData= await Cart.findOne({userId:userId})

        const cartLength = cartData ? cartData.product.length : 0
        if (req.query.filter) {
            let products
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
                }
            ]);
            res.render('shop', { product: products, categories, name: userData.name, search: search ,cartLength});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}






const profileEdit = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log("body ", req.body)
        const userId = req.session.user;
        const user = await User.findOne({ _id: userId });
        if (!user) {
            console.error('User not found');
            res.redirect('/loadProfile');
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('passsword match :', passwordMatch)
        if (passwordMatch) {
            const updated = await User.updateOne({ _id: userId }, { $set: { name, email } });
            console.log(updated)
           res.json({success:true, message: 'Profile updated sucesfully !' });

            // res.redirect('/loadProfile');
        } else {
            console.log("///////////toastr////////////")
            return res.json({ message: 'Password does not match' });
        }

    } catch (error) {
        console.error(error);
        // res.redirect('/loadProfile');
    }
}

const updateAddress = async (req, res) => {
    try {
        const { name, mobile, houseName, city, state, pinCode } = req.body;
        console.log("body////////////////////", req.body);
        const userId = req.session.user;
        const updated = await Address.findByIdAndUpdate({ _id: req.query.id }, { $set: { name, mobile, houseName, city, state, pinCode } });
        console.log(updated);

        res.redirect('/loadCheckOut');
    } catch (error) {
        console.error(error);
    }
};


const loadAddAddress = async (req, res) => {
    try {
  
        res.render('addAddress');
    } catch (error) {
        console.error(error);
    }
};


const loadEditAddress = async (req, res) => {
    try {
        const userId = req.session.user;
        const addressData = await Address.findById(req.query.id);

        res.render('editAddress', { addresses: addressData });
        //  res.render("editAddress",{})


    } catch (error) {
        console.error(error);
    }
};





const addAddress = async (req, res) => {
    try {
        const userId = req.session.user
        const { name, mobile, houseName, city, state, pinCode } = req.body;
        // console.log("gydfyiyh")
        // console.log(req.body)
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
        // console.log("gydfyiyh")
        // console.log(req.body)
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


const removeAddress = async (req, res) => {
    try {
        const { addressId } = req.body;

        // Find the address by its ID and delete it
        const deletedAddress = await Address.findOneAndDelete({ _id: addressId });

        if (!deletedAddress) {
            // If the address with the given ID is not found, return a 404 status
            return res.status(404).json({ error: 'Address not found' });
        }

        res.status(200).json({ message: 'Address removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' }); // Send error response
    }
};





// const loadAddress = async (req, res) => {
//     try {

//         const { name, mobile, houseName , city , state,  pinCode} = req.body;
//         // console.log("gydfyiyh")
//         // console.log(req.body)
//         const address = new Address({
//            name:name,
//             mobile: mobile,
//             houseName :houseName ,
//             city:city,
//             state:state,
//             pinCode:pinCode

//         });

//        await address.save();
//        if(couponData){
//         res.redirect('/admin/loadProfile')
//        }

//     } catch (error) {
//         console.error(error);
//     }
// };



const OrderCancelled = async (req, res) => {
    try {
        const orderId = req.query.id
        const orderReturned = await Orders.findByIdAndUpdate(orderId, { $set: { orderStatus: 'Cancelled' } })
        res.redirect('/loadProfile')



    } catch (error) {
        console.log(error.message)

    }
}


const orderReturn = async (req, res) => {
    try {
        const orderId = req.query.id
        const orderReturned = await Orders.findByIdAndUpdate(orderId, { $set: { orderStatus: 'orderReturn' } })
        res.redirect('/loadProfile')



    } catch (error) {
        console.log(error.message)

    }
}




const orderDetail = async (req, res) => {
    try {
        res.render('ordersdetail')


    } catch (error) {
        console.log(error.message)

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
            // Find the category object by its name
            const categoryObj = await Category.findOne({ categoryName: category });
            if (!categoryObj) {
                return res.status(404).send('Category not found');
            }

            // Find books belonging to the selected category
            products = await Product.find({ Categories: categoryObj._id, is_Active: true }).populate('Categories');
        } else {
            // Perform regular search or filtering
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
    addAddress,
    removeAddress,
    OrderCancelled,
    orderReturn,
    orderDetail,
    categorySearch,
    loadEditAddress,
    updateAddress,
    loadAddAddress,
    addAddress1,
    loadOrderDetails,
    loadInvoice


    // loadAddress


}







