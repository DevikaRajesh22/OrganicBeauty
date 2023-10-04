const userController=require('../controllers/userController');
const productController=require('../controllers/productController');
const userAuth=require('../middleware/userAuth');
const express=require('express');
const userRoute=express();

//setting view engine
userRoute.set('views', './views');
userRoute.set('view engine', 'ejs');

//routes for users
userRoute.get('/', userController.loginGet);
userRoute.post('/login', userAuth.isLoggedOut, userController.userLoginPost)
userRoute.get('/register',userController.registerGet);
userRoute.post('/registerPost',userController.registerPost);
userRoute.get('/landingPage',userAuth.isLoggedIn, userController.landingPage);
userRoute.get('/products',userController.productsGet);
userRoute.get('/error',userController.error);
userRoute.get('/otp',userController.otp);
userRoute.post('/otp',userController.otpPost);
userRoute.get('/logout',userController.logout);

module.exports=userRoute;