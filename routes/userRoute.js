const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const cartController=require('../controllers/cartController');
const orderController=require('../controllers/orderController');
const userAuth = require('../middleware/userAuth');
const express = require('express');
const userRoute = express();

//setting view engine
userRoute.set('views', './views');
userRoute.set('view engine', 'ejs');

//routes for users
userRoute.get('/login',userController.loginGet);
userRoute.post('/login', userAuth.isLoggedOut, userController.userLoginPost);
userRoute.get('/forgotPassword',userController.forgotPassword);
userRoute.post('/forgotPassword',userController.forgotPasswordPost);
userRoute.get('/forgotPasswordChange',userController.forgotPasswordChange);
userRoute.post('/forgotPasswordChange',userController.forgotPasswordChangePost);
userRoute.get('/register', userController.registerGet);
userRoute.post('/registerPost', userController.registerPost);
userRoute.get('/', userController.landingPage);
userRoute.get('/products', userController.productsGet);
userRoute.get('/otp', userAuth.isLoggedOut, userController.otp);
userRoute.post('/otp', userController.otpPost);
userRoute.get('/logout', userController.logout);
userRoute.get('/productDetails',userController.productDetails);
userRoute.get('/about',userController.about);
userRoute.get('/contact',userController.contact);

//routes for cart management
userRoute.get('/cart',cartController.cartGet);
userRoute.post('/add',cartController.addToCartPost);
userRoute.post('/cartModify',cartController.updateCartQuantity);
userRoute.post('/removeProduct',cartController.removeProduct);
userRoute.get('/checkout',cartController.checkout);
userRoute.get('/editAddress',cartController.editAddress);
userRoute.post('/editAddressPost',cartController.editAddressPost);
userRoute.get('/success',cartController.success);

//routes for order management
userRoute.get('/orders',orderController.orders);
userRoute.post('/placeOrder',orderController.placeOrder);

//routes for profile management
userRoute.get('/account',userController.account);
userRoute.post('/accountPost',userController.accountPost);
userRoute.get('/changePassword',userController.changePassword);
userRoute.get('/address',userController.address);
userRoute.get('/addAddress',userController.addAddress);
userRoute.post('/addAddress',userController.addAddressPost);
userRoute.get('/adelete/:id',userController.deleteAddress);


module.exports = userRoute;