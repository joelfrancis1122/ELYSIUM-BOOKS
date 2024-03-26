const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const User = require('../models/userModel')
const Coupon = require('../models/couponModel')
const Orders = require('../models/orderModel')



const dashboardLoad  = async (req, res) => {
    try {
        res.render('admindashboard')
    } catch (error) {
        console.error(error)
    }
}



const adminLogin = async(req,res)=>{
    try{
res.render('login')
    }catch{
        console.error(error)
    }
}




const productslist = async(req,res)=>{ 
    try{
        let search = req.query.search ? req.query.search : "" 
        const productData = await Product.find({
            $and:[{
            Bookname: { $regex: new RegExp(search, "i") } },
            ],
        }).populate('Categories').sort({ CreatedOn: -1 })
        res.render('productslist',{product:productData,search:search})
    }catch(error){
console.error(error);
    }
}


//=======================categories================================\\
const loadCategories = async(req,res)=>{
    try {
        const catData = await Category.find()
           if(catData){
          res.render('addCategories',{categories : catData})
           }
    } catch (error) {
        console.log(error.message);
    }
}



const addCategories = async (req, res) => {
    try {
        const { categoryName, Description } = req.body;
        const catData = await Category.find()
        const existingCategory = await Category.findOne({ categoryName: { $regex: new RegExp('^' + categoryName + '$', 'i') } });
        if (existingCategory) {
            return res.render('addcategories', { categoriesExists: true ,categories : catData}); // Pass flag to indicate category exists
        }
        const categories = new Category({
            categoryName: categoryName,
            Description: Description,
        });
        const categoryData = await categories.save();
        res.redirect('/admin/loadCategories');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
};



const loadeditCategory = async(req,res)=>{
try {
    const categories = await Category.findById(req.query.id);
    req.session.cateid=req.query.id
    res.render('editcategories',{categories})
} catch (error) {
    console.error(error)
}}



const editCategory = async(req,res)=>{
    try{
        const { categoryName,Description} = req.body
        const updated = await Category.findByIdAndUpdate({ _id:  req.session.cateid }, { $set: {  categoryName, Description } })
        res.redirect("/admin/loadCategories")
        console.log(updated)
    }catch(error){
        console.log(error.message)
    }
}



const ToggleblockCategories = async (req,res)=>{
    try{
        const catid= req.query.catid
        const categories = await Category.findOne({_id:catid}); 
        categories. is_Active=!categories. is_Active
        await categories.save()
        res.redirect('/admin/loadCategories');
    } catch (error) {
        console.error(error);
    }
}



const loaduserlist = async (req, res) => {
    try {
        const userData = await User.find({is_admin:false})
        res.render('userlist',{users:userData})
    } catch (error) {
        console.error(error)
    }
}



const ToggleblockUser = async (req,res)=>{
    try{
        const id= req.query.id
        const user = await User.findOne({_id:id}); // why new true
        user.is_active=!user.is_active
        await user.save()
        res.redirect('/admin/loaduserlist');
    } catch (error) {
        console.error(error);
    }
}



const loadOrders = async (req,res)=>{
    try {
        const userId = req.session.user;
        const orders = await Orders.find();
        res.render("orderList",{orders:orders})
    } catch (error) {
        console.log(error.message)  
    }
}



const loadOrderDetails = async (req,res)=>{
    try {
        const productId = req.query.id
        const orders = await Orders.findOne({ _id:productId}).populate('product.productId')
        const orderData = await Orders.findOne({ _id:productId})
        res.render("ordersview",{orders,orderData})
    } catch (error) {
        console.log(error.message)  
    }
}



const loadCoupon = async (req, res) => {
    try {
        const couponData = await Coupon.find().sort({ Date: -1 })
        res.render('Coupon',{couponData})
    } catch (error) {
        console.error(error)
    }
}



const loadLogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.error(error)
    }
}



const adminOrderPending= async(req,res)=>{
    try {
        const orderId= req.query.id
        const orderPending= await Orders.findByIdAndUpdate(orderId,{$set:{orderStatus:"Pending"}})
        res.redirect('/admin/loadOrders')
    } catch (error) {
        console.log(error.message)
    }
}



const adminOrderShipped= async(req,res)=>{
    try {
        const orderId= req.query.id
        const orderShipped =await Orders.findByIdAndUpdate(orderId,{$set:{ orderStatus:'Shipped'}})
         res.redirect('/admin/loadOrders')
    } catch (error) {
        console.log(error.message)
    }
}



const adminOrderDelivered=async(req,res)=>{
    try {
        const orderId= req.query.id
        const orderDelivered= await  Orders.findByIdAndUpdate(orderId,{$set:{orderStatus:'Delivered'}})
         res.redirect('/admin/loadOrders')
    } catch (error) {
        console.log(error.message)
    }
}



const adminOrderReturned=async(req,res)=>{
    try {
        const orderId= req.query.id
        const orderReturned= await  Orders.findByIdAndUpdate(orderId,{$set:{orderStatus:'Returned'}})
        res.redirect('/admin/loadOrders')
    } catch (error) {
        console.log(error.message)
    }
}


const adminOrderCancelled=async(req,res)=>{
    try {
        const orderId= req.query.id
        const OrderCancelled= await Orders.findByIdAndUpdate(orderId,{$set:{orderStatus:'Cancelled'}})
        res.redirect('/admin/loadOrders')
    } catch (error) {
        console.log(error.message)
    }
}



module.exports = {
    dashboardLoad,
    adminLogin,
    productslist,
    addCategories,
    loadCategories,
    loaduserlist,
    loadLogout,
    loadOrders,
    loadOrderDetails,
    loadCoupon,
    ToggleblockCategories,
    ToggleblockUser,
    adminOrderReturned,
    adminOrderDelivered,        
    adminOrderShipped,
    adminOrderPending,
    loadeditCategory,
    editCategory,
    adminOrderCancelled


}