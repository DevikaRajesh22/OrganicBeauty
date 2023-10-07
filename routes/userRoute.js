const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const cartController=require('../controllers/cartController');
const userAuth = require('../middleware/userAuth');
const express = require('express');
const userRoute = express();

//setting view engine
userRoute.set('views', './views');
userRoute.set('view engine', 'ejs');

//routes for users
userRoute.get('/', userController.loginGet);
userRoute.post('/login', userAuth.isLoggedOut, userController.userLoginPost)
userRoute.get('/register', userController.registerGet);
userRoute.post('/registerPost', userController.registerPost);
userRoute.get('/landingPage', userAuth.isLoggedIn, userController.landingPage);
userRoute.get('/products', userController.productsGet);
userRoute.get('/otp', userAuth.isLoggedOut, userController.otp);
userRoute.post('/otp', userController.otpPost);
userRoute.get('/logout', userController.logout);
userRoute.get('/productDetails',userController.productDetails);
userRoute.get('/about',userController.about);
userRoute.get('/contact',userController.contact);

//routes for cart and checkouts
userRoute.get('/cart',cartController.cartGet);
userRoute.post('/addToCart',cartController.addToCartPost);


module.exports = userRoute;