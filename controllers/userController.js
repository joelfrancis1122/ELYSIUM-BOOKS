
const session = require('express-session')
const Product = require('../models/productModel')

const User = require('../models/userModel')
const nodemailer = require('nodemailer')





const loadHome = async (req, res) => {
    try {
        let userId = req.session.user
        console.log(userId,"user");
        let search = req.query.search ? req.query.search : "" 
        const productData = await Product.find({
            $and:[{
            Bookname: { $regex: new RegExp(search, "i") } },
            ],
        })
        const userData = await User.findOne({_id:userId})
        console.log(userData.name,"ghygh");

        res.render('home',{product:productData,search:search,name:userData.name})
    } catch (error) {
        console.log(error)

    }
}


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

const verifyLogin=async(req,res)=> {
    try {
        const {email,password}=req.body
        const userData=await User.findOne({email:email})
        if(userData){
            if(password===userData.password){
                if(userData.is_active==true){
    
                    if (userData.is_admin === true) {
                        req.session.admin = userData._id;
                        console.log("hai0000000");
                        res.redirect("/admin/dashboard");
                    } else {
                        req.session.user = userData._id;
                        
                        res.redirect("/home");
                    }
                } else{
                    res.render("login", { bannedMessage: "user banned" });

                }
                } else {
                    res.render("login", { errmessage: "." });
                }        }
                  
    } catch (error) {
        console.log(error)
    }
}


const signup=async(req,res)=>{
    try {

        res.render('registeration')
        
    } catch (error) {
        console.log(error)
        
    }
}


const verifySignup= async(req,res)=>{
    try {

console.log("hai");
const matchEmail = await User.findOne({email:req.body.email})
if(matchEmail){
    // toastr.error('Email already exists', 'Error')
    return res.redirect('/signup')
}
        if(req.body.password==req.body.cpassword){

           const datafromRegister={

            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            mobile:req.body.mobile
           }
           console.log(datafromRegister)

           req.session.data=datafromRegister

           console.log("session Data:",req.session.data)
        //    res.render('otp')
        res.redirect("/getOtp")

        }

        
    } catch (error) {

        console.log(error)
    }
}





const getOtp= async(req,res)=>{

    

        try {
      
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'joelfrancis422@gmail.com',
                   
                    pass:'apqo dnri yzpa gvcg'
                }
            });
    
            
            // ************generating otp************
    
            let randomotp=Math.floor(1000 + Math.random() * 9000).toString()

            req.session.otp=randomotp

            const {email,name}=req.session.data

        
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
    

   
const verifyOtp = async(req,res)=>{
    try {
        // const otp = req.body.otp     changed code
        if(req.session.otp===req.body.otp){
           const {email,name,mobile,password}=req.session.data
           const user = new User({
            name:name,
            email:email,
            mobile:mobile,
            password:password

            
           })
           
           const userData = await user.save()

           if(userData){
            res.render("login",{ successMessage: "." })
            res.redirect("/login")
            // res.rend("login", { successMessage: " Registered Succesfully !!" });
           }
        }else{
            res.render("registeration", { errmessage: "."}) 
        }


    } catch (error) {
        console.log(error)
    }
}


const shopProduct=async(req,res)=>{
    try {
        let productId=req.query.id
        const productData = await Product.findOne({_id:productId})  
        console.log(productData)
        res.render('shop-right',{product:productData})
        
    } catch (error) {
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
    shopProduct
    
    
   
 
    
}







