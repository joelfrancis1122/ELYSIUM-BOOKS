const express= require('express')
const admin_Route = express()
const multer = require('multer')
const path  = require('path')

admin_Route.set('view engine','ejs')
admin_Route.set('views','./views/admin')

const adminController = require('../controllers/adminController')
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

// admin_Route.use(Auth.preventAdminAccessForUser)

admin_Route.get('/dashboard',Auth.isLogin,adminController.dashboardLoad)
admin_Route.get('/productslist',Auth.isLogin,adminController.productslist)

admin_Route.get('/loadaddproduct',Auth.isLogin,productControllers.loadaddproduct)
admin_Route.post('/addProduct',Auth.isLogin,upload.array('Images',5),productControllers.addProduct)


admin_Route.get('/loadeditProduct',Auth.isLogin,productControllers.loadeditProduct)
admin_Route.post('/editProduct',Auth.isLogin,upload.array('Images',5),productControllers.editProduct)

admin_Route.get('/blockProduct',Auth.isLogin,productControllers.blockProduct)
admin_Route.get('/blockuser',Auth.isLogin,adminController.blockUser)
admin_Route.get('/unblockProduct',Auth.isLogin,productControllers.unblockProduct)
admin_Route.get('/unblockuser',Auth.isLogin,adminController.unblockUser)
admin_Route.get('/loadCategories',Auth.isLogin,adminController.loadCategories)
admin_Route.post('/addCategories',Auth.isLogin,adminController.addCategories)
admin_Route.get('/blockCategories',Auth.isLogin,adminController.blockCategories)
admin_Route.get('/unblockCategories',Auth.isLogin,adminController.unblockCategories)
admin_Route.get('/loaduserlist',Auth.isLogin,adminController.loaduserlist)

admin_Route.get('/logout',Auth.isLogin,adminController.loadLogout)

// admin_route.post('/addproduct',auth.isLogin,productController.insertProduct);

module.exports=admin_Route

