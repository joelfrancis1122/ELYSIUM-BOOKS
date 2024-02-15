const express= require('express')
const user_Route = express()

const userControllers = require('../controllers/userController')
const Auth = require('../middlewares/userAuth')



user_Route.set('view engine','ejs')
user_Route.set('views','./views/users')
// user_Route.use(Auth.preventUserAccessForAdmin)



//--------------------------------------------------

user_Route.get('/',Auth.isLogout,userControllers.loadlogin)
user_Route.get('/home',Auth.isLogin,userControllers.loadHome)
user_Route.get('/logout',Auth.isLogin,userControllers.loadLogout)

user_Route.get('/login',Auth.isLogout,userControllers.loadlogin)

user_Route.get('/signup',Auth.isLogout,userControllers.signup)
user_Route.post('/verifySignup',Auth.isLogout,userControllers.verifySignup)


user_Route.get('/getOtp',Auth.isLogout,userControllers.getOtp)
user_Route.post('/verifyOtp',Auth.isLogout,userControllers.verifyOtp)
user_Route.post('/verifyLogin',Auth.isLogout,userControllers.verifyLogin)
user_Route.get('/shop-product',Auth.isLogin,userControllers.shopProduct)
























module.exports=user_Route