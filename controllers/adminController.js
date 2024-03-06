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

const addCategories = async (req, res) => {
    try {
        const { categoryName, Description } = req.body;
        const catData = await Category.find()
        const existingCategory = await Category.findOne({ categoryName: { $regex: new RegExp('^' + categoryName + '$', 'i') } });
        if (existingCategory) {
            return res.render('addcategories', { categoriesExists: true ,categories : catData}); // Pass flag to indicate category exists
        }
        // Category name is unique, proceed to save
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


const blockCategories = async (req,res)=>{
    try{
        const catid= req.query.catid
        const blockedCategory = await Category.findByIdAndUpdate(catid, {is_Active:false }, { new: true }); // why new true its used for geting a  return value 
        res.redirect('/admin/loadCategories');
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error');
    }
}

const unblockCategories = async (req,res)=>{
    try{
        const catid= req.query.catid
        const unblockCategory = await Category.findByIdAndUpdate(catid, {is_Active:true }, { new: true }) 
        res.redirect('/admin/loadCategories',);
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error');
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
        console.log(error);
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





const ToggleblockUser = async (req,res)=>{
    try{
        const id= req.query.id
        const user = await User.findOne({_id:id}); // why new true
        user.is_active=!user.is_active
        await user.save()
        res.redirect('/admin/loaduserlist');
    } catch (error) {
        console.log(error);
    }
}




const loadOrders = async (req,res)=>{
    try {
        res.render("orderList")
    } catch (error) {
        console.log(error.message)  
    }
}



const loadOrderDetails = async (req,res)=>{
    try {
        res.render("ordersdetail")
    } catch (error) {
        console.log(error.message)  
    }
}




const loadCoupon = async (req, res) => {
    try {
        res.render('Coupon')
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
    ToggleblockCategories,
    loadOrders,
    loadOrderDetails,
    ToggleblockUser,
    loadCoupon,
}