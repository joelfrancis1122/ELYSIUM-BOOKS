
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Cart = require('../models/cartModel')

const bcrypt = require('bcrypt');
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
        console.log(error);
    }
};


const signup = async (req, res) => {
    try {

        res.render('registeration',{ emailExists: false})

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

            console.log(hashedPassword,"hashed password confirmed !!!!!!!!!!!!!!")
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
        const userData = await User.findOne({ _id: userId });
        res.render('singleproduct', { product: productData ,name:userData.name})

    } catch (error) {
        console.log(error)

    }
}


const loadProfile = async (req,res)=>{
    try{
        let userId = req.session.user;
        const userData = await User.findOne({ _id: userId });
        res.render('account',{name:userData.name,email:userData.email})
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
    loadProfile,
    loadShop,


}







