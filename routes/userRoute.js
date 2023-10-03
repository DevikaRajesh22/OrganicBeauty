const userController=require('../controllers/userController');
const productController=require('../controllers/productController');
const userAuth=require('../middleware/userAuth');
const express=require('express');
const userRoute=express();

//setting view engine
userRoute.set('views', './views');
userRoute.set('view engine', 'ejs');

//routes for users
userRoute.get('/', userAuth.isLoggedOut, userAuth.isLoggedIn ,userController.loginGet);
userRoute.post('/login',userAuth.isLoggedIn, userAuth.isLoggedOut, userController.userLoginPost)
userRoute.get('/register',userController.registerGet);
userRoute.post('/registerPost',userController.registerPost);
userRoute.get('/landingPage',userAuth.isLoggedOut, userAuth.isLoggedIn, userController.landingPage);
userRoute.get('/products',productController.productsGet);
userRoute.get('/error',userController.error);
userRoute.get('/otp',userController.otp);
userRoute.post('/otp',userController.otpPost);
userRoute.get('/logout',userController.logout);

module.exports=userRoute;