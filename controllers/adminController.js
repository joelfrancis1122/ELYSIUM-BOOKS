const session = require('express-session')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const User = require('../models/userModel')

const dashboardLoad  = async (req, res) => {
    try {
        console.log('inside user dashboard');
        res.render('admindashboard')
    } catch (error) {
        console.log(error)

    }
}

const adminLogin = async(req,res)=>{
    try{
res.render('login')
    }catch{
        console.log(error)
    }
}

const productslist = async(req,res)=>{ 
    try{
        let search = req.query.search ? req.query.search : "" 
        const productData = await Product.find({
            $and:[{
            Bookname: { $regex: new RegExp(search, "i") } },
            
             
        
            ],
        }).populate('Categories');
        console.log(productData)
        productData.sort((a, b) => new Date(a.CreatedOn) - new Date(b.CreatedOn));
        res.render('productslist',{product:productData,search:search})
    }catch(error){
console.log(error);
    }
}
    

//=======================categories================================\\


const loadCategories = async(req,res)=>{
    try {
        const catData = await Category.find()
           if(catData){
          console.log("success");
          res.render('addCategories',{categories : catData})
           }
    } catch (error) {
        console.log(error.message);
    }
}

const addCategories = async(req,res)=>{
    try{
        console.log("s");
        
           const {categoryName,Description}=req.body
           const categories = new Category({
            categoryName:categoryName,
            Description:Description,
        
            
           })
          
           const categoryData = await categories.save()
           res.redirect('/admin/loadCategories')

    }catch(error){
        console.log(error.message)
    }
}


const blockCategories = async (req,res)=>{
    try{
        const catid= req.query.catid
        console.log(catid)
    
        const blockedCategory = await Category.findByIdAndUpdate(catid, {is_Active:false }, { new: true }); // why new true its used for geting a  return value 
        // res.render('addcategories');
res.redirect('/admin/loadCategories');
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error');
    }
}

const unblockCategories = async (req,res)=>{
    try{
        const catid= req.query.catid
        console.log(catid)
    
        const unblockCategory = await Category.findByIdAndUpdate(catid, {is_Active:true }, { new: true }) // why new true
        // console.log(blockedProduct==true);
        // res.render('addcategories');
        // if (blockedProduct) {
        // } else {
        //  res.status(404).send('Product not found.');
        // }
        res.redirect('/admin/loadCategories',);

    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error');
    }
}

const loaduserlist = async (req, res) => {
    try {
        const userData = await User.find({is_admin:false})
        console.log(userData)
        res.render('userlist',{users:userData})
    } catch (error) {
        console.log(error)

    }
}

const blockUser = async (req,res)=>{
    try{
        const id= req.query.id
    
        const blockedUser = await User.findByIdAndUpdate(id, {is_active:false }, { new: true }); // why new true
        // console.log(blockedProduct==true);
        res.redirect('/admin/loaduserlist');
        // if (blockedProduct) {
        // } else {
        //  res.status(404).send('Product not found.');
        // }

    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error');
    }
}


const unblockUser = async (req,res)=>{
    try{
        const id= req.query.id
    
        const unblockUser = await User.findByIdAndUpdate(id, {is_active:true }, { new: true }); // why new true
        // console.log(blockedProduct==true);
        res.redirect('/admin/loaduserlist');
        // if (blockedProduct) {
        // } else {
        //  res.status(404).send('Product not found.');
        // }

    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error');
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

module.exports = {
    dashboardLoad,
    adminLogin,
    productslist,
    addCategories,
    loadCategories,
    blockCategories,
    unblockCategories,
    loaduserlist,
    loadLogout,
    blockUser,
    unblockUser
}