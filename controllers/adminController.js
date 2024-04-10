const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const User = require('../models/userModel')
const Coupon = require('../models/couponModel')
const Orders = require('../models/orderModel')
const SubCategory = require('../models/subcategoryModel')
const cron = require('node-cron');

const dashboardLoad = async (req, res) => {
    try {
        const orders = await Orders.find();
        const categories = await Category.find();
        const products = await Product.find();

        // Extracting order counts for each month
        const orderCountsByMonth = Array.from({ length: 12 }, () => 0);
        orders.forEach(order => {
            const monthIndex = order.orderDate.getMonth();
            orderCountsByMonth[monthIndex]++;
        });

        // Extracting product counts for each month
        const productCountsByMonth = Array.from({ length: 12 }, () => 0);
        products.forEach(product => {
            const monthIndex = product.CreatedOn.getMonth();
            productCountsByMonth[monthIndex]++;
        });

        // Aggregate to find the best selling product
        const bestSellingProduct = await Orders.aggregate([
            {
                $unwind: "$product"
            },
            {
                $group: {
                    _id: "$product.productId",
                    totalSales: { $sum: "$product.quantity" }
                }
            },
            {
                $sort: { totalSales: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    productName: "$product.Bookname",
                    totalSales: 1
                }
            }
        ]);

        // Aggregate to find the best selling categories
        const bestSellingCategories = await Orders.aggregate([
            {
                $unwind: "$product"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "product.productId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            {
                $unwind: "$productInfo"
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productInfo.Categories",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $group: {
                    _id: "$category._id",
                    name: { $first: "$category.categoryName" }, // Corrected to use 'categoryName' instead of 'name'
                    totalSales: { $sum: "$product.quantity" }
                }
            },
            {
                $sort: { totalSales: -1 }
            },
            {
                $limit: 10
            }
        ]);
        

        res.render('admindashboard', { orders, categories, orderCountsByMonth, productCountsByMonth, bestSellingProduct, bestSellingCategories });
    } catch (error) {
        console.error(error);
    }
};






const adminLogin = async(req,res)=>{
    try{
res.render('login')
    }catch{
        console.error(error)
    }
}




const productslist = async(req,res)=>{ 
    try{
        console.log('worked ')
        let search = req.query.search ? req.query.search : "" 
        const productData = await Product.find({
            $and:[{
            Bookname: { $regex: new RegExp(search, "i") } },
            ],
        }).populate('Categories').sort({ CreatedOn: -1 })
        console.log('k',productData)
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

const loadSubCategories = async(req,res)=>{
    try {
        const catData = await SubCategory.find()
           if(catData){
          res.render('addSubCategories',{categories : catData})
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
        }else if(!existingCategory){
            
            
            
            const categories = new Category({
                categoryName: categoryName,
                Description: Description,
            });
            const categoryData = await categories.save();
            return res.render('addcategories', { categoriesExistss:true ,categories : catData}); // Pass flag to indicate category exists

            
         
         
         
    }

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
};


const addSubCategories = async (req, res) => {
    try {
        const { subCategoryName, Description } = req.body;
        const catData = await SubCategory.find()
        const existingCategory = await SubCategory.findOne({ subCategoryName: { $regex: new RegExp('^' + subCategoryName + '$', 'i') } });
        if (existingCategory) {
            return res.render('addcategories', { categoriesExists: true ,categories : catData}); // Pass flag to indicate category exists
        }
        const categories = new SubCategory({
            subCategoryName: subCategoryName,
            Description: Description,
        });
        const categoryData = await categories.save();
        res.redirect('/admin/loadSubCategories');
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
        const existingCategory = await Category.findOne({ categoryName: { $regex: new RegExp('^' + categoryName + '$', 'i') } });
        if(existingCategory){
            return res.json({ success: false, error: 'Category name must be unique' });       
         }else{
             res.json({ success: true, error: 'Category name changed successfull' });       

             const updated = await Category.findByIdAndUpdate({ _id:  req.session.cateid }, { $set: {  categoryName, Description } })
             res.redirect("/admin/loadCategories")
             console.log(updated)
         }
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



const ToggleblockSubCategories = async (req,res)=>{
    try{
        const catid= req.query.catid
        const categories = await SubCategory.findOne({_id:catid}); 
        categories. is_Active=!categories. is_Active
        await categories.save()
        res.redirect('/admin/loadSubCategories');
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
        const orderPending= await Orders.findByIdAndUpdate(orderId,{$set:{orderStatus:"Order Placed"}})
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


const salesReport = async(req,res)=>{
    try {

        const orderList = await Orders.find().populate("userId")
        const coupon = await Coupon.find()
        res.render("salesReport",{orderList,coupon})
    } catch (error) {
        console.error(error)
    }
}


const salesreportsearch = async(req,res)=>{
    try{
        
  
    const {start,end}= req.body;
    const endOfDay = new Date(end);
    endOfDay.setHours(23,59,59,999);
    const orderList = await Orders.find({
        orderDate:{$gte:new Date(start),$lte:endOfDay}

    }).populate('userId')
    res.render('salesReport',{orderList,start,end})



    }catch(error){
        console.error(error)
    }

}
const couponDelete = async (req, res) => {
    try {
        const couponId = req.query.id;

        console.log("couponId------------",couponId)
        const deletedCoupon = await Coupon.findOneAndDelete({ _id: couponId });

        if (deletedCoupon) {
            return res.json({ success: true, message: "Coupon deleted successfully" });
        } else {
            return res.json({ success: false, message: "Coupon not found" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}



const adminOffers = async(req,res)=>{
    try {
        
        const catData = await Category.find()
        const product = await Product.find()
           if(catData){
          res.render('adminOffer',{categories : catData,product})
           }
    } catch (error) {
        console.log(error.message);
    }
}

const applyAdminOffers = async(req,res)=>{
    try{
        const { categoryId, discount, expiry } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(
          categoryId,
          { offer: discount, expirationDate: expiry, OfferisActive: true },
          { new: true } 
        );
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
          }

          const productsToUpdate = await Product.find({ Categories: categoryId });
          if (!productsToUpdate) {
            console.log("============================================================")
            return res.status(404).json({ message: 'product not found' });
          }
          console.log("productsToUpdate++++++++++++++++++++++++++",productsToUpdate)
          for (const product of productsToUpdate) {
          const updatedPrice = Math.round(product.saleprice * ((100 - discount) / 100));
          product.saleprice = updatedPrice;
          console.log(updatedPrice,"++++++++++++++++ssadhgsadhsadghdsghasdghhdashsadhashhgasdhhgasdhgasdghgasghaahdhgadhj")
          await product.save();
         }

          res.status(200).json({ message: 'Offer applied successfully', category: updatedCategory });
          
    }catch(error){
        console.log(error.message)
    }
}



const checkingAdminOffers = async () => {
    try {
    
    const expiredCategories = await Category.find({ expirationDate: { $lte: new Date() }, OfferisActive: true });

    for (const category of expiredCategories) {
      
        category.offer = 0;
        category.expirationDate = null;
        category.OfferisActive = false;
        await category.save();

       
        const productsToUpdate = await Product.find({Categories:category._id});
        for (const product of productsToUpdate) {
            product.saleprice = product.Regularprice;
            await product.save();
        }
    }

        console.log('Expired offers checked and reset successfully.');

        
    } catch (error) {
     console.error('Error checking and resetting expired offers:', error);
   }
};

 cron.schedule('0 0 * * *', checkingAdminOffers);



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
    adminOrderCancelled,
    loadSubCategories,
    ToggleblockSubCategories,
    addSubCategories,
    salesReport,
    salesreportsearch,
    couponDelete,
    adminOffers,
    applyAdminOffers

}