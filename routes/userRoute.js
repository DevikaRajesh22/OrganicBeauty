const userController = require('../controllers/userController');
const cartController=require('../controllers/cartController');
const orderController=require('../controllers/orderController');
const profileController=require('../controllers/profileController');
const couponController=require('../controllers/couponController');
const walletController=require('../controllers/walletController');
const wishlistController=require('../controllers/wishlistController');
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
userRoute.get('/products',  userAuth.isLoggedIn, userController.productsGet);
userRoute.get('/otp', userAuth.isLoggedOut, userAuth.isLoggedIn, userController.otp);
userRoute.post('/otp', userController.otpPost);
userRoute.get('/logout', userController.logout);
userRoute.get('/productDetails', userAuth.isLoggedIn, userController.productDetails);
userRoute.get('/about', userAuth.isLoggedIn, userController.about);
userRoute.get('/contact', userAuth.isLoggedIn, userController.contact);

//routes for cart management
userRoute.get('/cart',  userAuth.isLoggedIn, cartController.cartGet);
userRoute.post('/add', cartController.addToCartPost);
userRoute.post('/cartModify', cartController.updateCartQuantity);
userRoute.post('/removeProduct',cartController.removeProduct);
userRoute.get('/checkout', userAuth.isLoggedIn, cartController.checkout);
userRoute.get('/editAddress',  userAuth.isLoggedIn, cartController.editAddress);
userRoute.post('/editAddressPost',cartController.editAddressPost);
userRoute.get('/success',  userAuth.isLoggedIn, cartController.success);
userRoute.post('/verifyPayment',cartController.verifyPayment);

//routes for order management
userRoute.get('/orders',  userAuth.isLoggedIn, orderController.orders);
userRoute.post('/placeOrder',orderController.placeOrder);
userRoute.get('/orderDet',  userAuth.isLoggedIn, orderController.orderDet);
userRoute.get('/cancelOrder',orderController.cancelOrder);
userRoute.get('/returnOrder',  userAuth.isLoggedIn, orderController.returnOrder);

//routes for profile management
userRoute.get('/account',  userAuth.isLoggedIn, profileController.account);
userRoute.post('/accountPost',profileController.changePasswordPost); //change password post request route
userRoute.get('/changePassword',  userAuth.isLoggedIn, profileController.changePassword);
userRoute.get('/address',  userAuth.isLoggedIn, profileController.address);
userRoute.get('/addAddress',  userAuth.isLoggedIn, profileController.addAddress);
userRoute.post('/addAddress',profileController.addAddressPost);
userRoute.get('/adelete/:id',profileController.deleteAddress);

//route for coupons
userRoute.post('/applyCoupon',couponController.applyCoupon);
userRoute.get('/removeCoupon',couponController.removeCoupon);

//route for wallet
userRoute.get('/wallet',  userAuth.isLoggedIn, walletController.wallet);

//route for wishlist
userRoute.get('/wishlist',  userAuth.isLoggedIn, wishlistController.wishlist);
userRoute.post('/addToWishlist',userAuth.isLoggedIn,wishlistController.addToWishlist);
userRoute.post('/removeFromWishlist',userAuth.isLoggedIn,wishlistController.removeFromWishlist);

module.exports = userRoute;