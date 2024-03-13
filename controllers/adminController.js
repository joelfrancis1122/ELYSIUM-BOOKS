const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const User = require('../models/userModel')
const Coupon = require('../models/couponModel')
const Orders = require('../models/orderModel')


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
        const userId = req.session.user;
        const orders = await Orders.find();
        res.render("orderList",{orders:orders})
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
        const couponData = await Coupon.find()
        console.log("Coupo data: " , couponData)
        res.render('Coupon',{couponData})
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


const deleteImage = async (req, res) => {
    try {
        const fileName = req.query.fileName;

        // Find the product containing the image
        const product = await Product.findOne({ Images: fileName });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Remove the image from the Images array
        product.Images = product.Images.filter(image => image !== fileName);

        // Save the updated product
        await product.save();

        res.sendStatus(200); // Send success response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' }); // Send error response
    }
};




// const updateOrderStatus = async (req, res) => {

//     try {
//         const { orderId, newStatus } = req.body;

//         // Update order status in the database
//         const updatedOrder = await Orders.findOneAndUpdate({ orderId }, { orderStatus: newStatus }, { new: true });

//         res.json({ success: true, updatedOrder });
//     } catch (error) {
//         console.error('Error updating order status:', error);
//         res.status(500).json({ success: false, message: 'Failed to update order status' });
//     }
// }

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
    deleteImage,
    adminOrderReturned,
    adminOrderDelivered,
    adminOrderShipped,
    adminOrderPending,


}