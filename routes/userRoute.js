const express= require('express')
const userRoute = express()

const userControllers = require('../controllers/userController')
const cartControllers = require('../controllers/cartController')
const Auth = require('../middlewares/userAuth')



userRoute.set('view engine','ejs')
userRoute.set('views','./views/users')
// userRoute.use(Auth.preventUserAccessForAdmin)


//--------------------------------------------------

userRoute.get('/',Auth.isLogout,userControllers.loadlogin)
userRoute.get('/home',Auth.isLogin,userControllers.loadHome)
userRoute.get('/logout',Auth.isLogin,userControllers.loadLogout)

userRoute.get('/login',Auth.isLogout,userControllers.loadlogin)

userRoute.get('/signup',Auth.isLogout,userControllers.signup)
userRoute.post('/verifySignup',Auth.isLogout,userControllers.verifySignup)


userRoute.get('/getOtp',Auth.isLogout,userControllers.getOtp)
userRoute.post('/verifyOtp',Auth.isLogout,userControllers.verifyOtp)
userRoute.post('/verifyLogin',Auth.isLogout,userControllers.verifyLogin)
userRoute.get('/shop-product',Auth.isLogin,userControllers.shopProduct)
userRoute.get("/loadProfile",Auth.isLogin,userControllers.loadProfile)
userRoute.get('/loadShop',Auth.isLogin,userControllers.loadShop)




userRoute.get("/cart",Auth.isLogin,cartControllers.getCart)
userRoute.get('/addToCart',Auth.isLogin,cartControllers.addToCart)
userRoute.post("/updateCart",Auth.isLogin,cartControllers.updateCart)
userRoute.post("/removeItem",Auth.isLogin,cartControllers.removeItem)
userRoute.get("/loadCheckOut",Auth.isLogin,cartControllers.isCartEmpty,cartControllers.loadCheckOut)
userRoute.get("/placeOrder",Auth.isLogin,cartControllers.placeOrder)
























module.exports=userRoute