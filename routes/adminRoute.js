const express = require('express')
const adminRoute = express()
const multer = require('multer')

const MulterImage = require('../config/multer')
// const  = require('../config/multer')

adminRoute.set('view engine', 'ejs')
adminRoute.set('views', './views/admin')

const adminControllers = require('../controllers/adminController')
const productControllers = require('../controllers/productController')
const cartControllers = require('../controllers/cartController')
const Auth = require('../middlewares/adminAuth')





adminRoute.get('/dashboard', Auth.isLogin, adminControllers.dashboardLoad)
adminRoute.get('/productslist', Auth.isLogin, adminControllers.productslist)

adminRoute.get('/loadaddproduct', Auth.isLogin, productControllers.loadaddproduct)
adminRoute.post('/addProduct', Auth.isLogin, MulterImage.upload.array('Images', 5), productControllers.addProduct)


adminRoute.get('/loadeditProduct', Auth.isLogin, productControllers.loadeditProduct)
adminRoute.post('/editProduct', Auth.isLogin, MulterImage.upload.array('Images', 5), productControllers.editProduct)

adminRoute.get('/ToggleblockProduct', Auth.isLogin, productControllers.ToggleblockProduct)
adminRoute.get('/ToggleblockUser', Auth.isLogin, adminControllers.ToggleblockUser)
adminRoute.get('/ToggleblockCategories', Auth.isLogin, adminControllers.ToggleblockCategories)


adminRoute.get('/loadCategories', Auth.isLogin, adminControllers.loadCategories)
adminRoute.post('/addCategories', Auth.isLogin, adminControllers.addCategories)
adminRoute.get('/loadeditCategory',Auth.isLogin,adminControllers.loadeditCategory)
adminRoute.post('/editCategory',Auth.isLogin,adminControllers.editCategory)


adminRoute.get('/loaduserlist', Auth.isLogin, adminControllers.loaduserlist)
adminRoute.get('/loadOrders', Auth.isLogin, adminControllers.loadOrders)
adminRoute.get('/loadOrderDetails', Auth.isLogin, adminControllers.loadOrderDetails)
adminRoute.get('/loadCoupon', Auth.isLogin, adminControllers.loadCoupon)
adminRoute.post('/addCoupon', Auth.isLogin, cartControllers.addCoupon)
adminRoute.get('/ToggleblockCoupon', Auth.isLogin, cartControllers.ToggleblockCoupon)
adminRoute.post('/removeImage', Auth.isLogin, productControllers.removeImage)


//order status
adminRoute.get('/adminOrderpending', Auth.isLogin, adminControllers.adminOrderPending)
adminRoute.get('/adminOrderShipped', Auth.isLogin, adminControllers.adminOrderShipped)
adminRoute.get('/adminOrderDelivered', Auth.isLogin, adminControllers.adminOrderDelivered)
adminRoute.get('/adminOrderReturned', Auth.isLogin, adminControllers.adminOrderReturned)
// adminRoute.get('/adminOrderdetails',Auth.isLogin,adminControllers.orderDetails)



adminRoute.get('/logout', Auth.isLogin, adminControllers.loadLogout)


module.exports = adminRoute

