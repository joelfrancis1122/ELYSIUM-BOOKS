const express= require('express')
const adminRoute = express()
const multer = require('multer')
const path  = require('path')

adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')

const adminControllers = require('../controllers/adminController')
const productControllers = require('../controllers/productController')
const Auth = require('../middlewares/adminAuth')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads');
        console.log("Destination Path: ", uploadPath); // Logging destination path
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

const upload = multer({storage:storage})


adminRoute.get('/dashboard',Auth.isLogin,adminControllers.dashboardLoad)
adminRoute.get('/productslist',Auth.isLogin,adminControllers.productslist)

adminRoute.get('/loadaddproduct',Auth.isLogin,productControllers.loadaddproduct)
adminRoute.post('/addProduct',Auth.isLogin,upload.array('Images',5),productControllers.addProduct)


adminRoute.get('/loadeditProduct',Auth.isLogin,productControllers.loadeditProduct)
adminRoute.post('/editProduct',Auth.isLogin,upload.array('Images',5),productControllers.editProduct)

adminRoute.get('/ToggleblockProduct',Auth.isLogin,productControllers.ToggleblockProduct)
adminRoute.get('/ToggleblockUser',Auth.isLogin,adminControllers.ToggleblockUser)
adminRoute.get('/ToggleblockCategories',Auth.isLogin,adminControllers.ToggleblockCategories)


adminRoute.get('/loadCategories',Auth.isLogin,adminControllers.loadCategories)
adminRoute.post('/addCategories',Auth.isLogin,adminControllers.addCategories)


adminRoute.get('/loaduserlist',Auth.isLogin,adminControllers.loaduserlist)
adminRoute.get('/loadOrders',Auth.isLogin,adminControllers.loadOrders)
adminRoute.get('/loadOrderDetails',Auth.isLogin,adminControllers.loadOrderDetails)
adminRoute.get('/loadCoupon',Auth.isLogin,adminControllers.loadCoupon)



adminRoute.get('/logout',Auth.isLogin,adminControllers.loadLogout)

// adminRoute.post('/addproduct',auth.isLogin,productController.insertProduct);

module.exports=adminRoute

