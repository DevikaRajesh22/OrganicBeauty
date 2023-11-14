const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const offerController = require('../controllers/offerController');
const adminAuth = require('../middleware/adminAuth');
const express = require('express');
const adminRoute = express();
const multer = require('../middleware/multer');

//setting view engine
adminRoute.set('views', './views');
adminRoute.set('view engine', 'ejs');

//admin routes
adminRoute.get('/', adminAuth.isLoggedOut, adminController.loginGet);
adminRoute.post('/login', adminController.loginPost);
adminRoute.get('/landing', adminAuth.isLoggedIn, adminController.landing);
adminRoute.get('/signout', adminAuth.isLoggedIn, adminController.signout);

//user management
adminRoute.get('/users', adminAuth.isLoggedIn, adminController.users);
adminRoute.get('/block/:id', adminAuth.isLoggedIn, adminController.blockUser);
adminRoute.get('/unblock/:id', adminAuth.isLoggedIn, adminController.unblockUser);

//product management
adminRoute.get('/products', adminAuth.isLoggedIn, productController.products);
adminRoute.get('/addProducts', adminAuth.isLoggedIn, productController.addProducts);
adminRoute.post('/addproducts', adminAuth.isLoggedIn, multer.upload.fields([{ name: "image1", maxCount: 1 }, { name: "image2", maxCount: 1 }, { name: "image3", maxCount: 1 }, { name: "image4", maxCount: 1 }]), productController.addProductsPost);
adminRoute.get('/pedit', adminAuth.isLoggedIn, productController.editProduct);
adminRoute.post('/pedit', adminAuth.isLoggedIn, multer.upload.fields([{ name: "image1", maxCount: 1 }, { name: "image2", maxCount: 1 }, { name: "image3", maxCount: 1 }, { name: "image4", maxCount: 1 }]), productController.editProductPost);
adminRoute.get('/hide/:id', adminAuth.isLoggedIn, productController.hideProduct);
adminRoute.get('/show/:id', adminAuth.isLoggedIn, productController.showProduct);

//category management
adminRoute.get('/category', adminAuth.isLoggedIn, categoryController.category);
adminRoute.get('/addCategory', adminAuth.isLoggedIn, categoryController.addCategory);
adminRoute.post('/addCategoryPost', adminAuth.isLoggedIn, categoryController.addCategoryPost);
adminRoute.get('/cblock', adminAuth.isLoggedIn, categoryController.blockCategory);
adminRoute.get('/cunblock', adminAuth.isLoggedIn, categoryController.unblockCategory);
adminRoute.get('/cedit', adminAuth.isLoggedIn, categoryController.editCategory);
adminRoute.post('/cedit', adminAuth.isLoggedIn, categoryController.editCategoryPost);

//order management
adminRoute.get('/ordersAdmin', adminAuth.isLoggedIn, orderController.orderGet);
adminRoute.post('/updateStatus', adminAuth.isLoggedIn, orderController.updateStatus);
adminRoute.get('/orderDetails', adminAuth.isLoggedIn, orderController.orderDetails);

//coupon management
adminRoute.get('/coupon', adminAuth.isLoggedIn, couponController.coupon);
adminRoute.get('/addCoupon', adminAuth.isLoggedIn, couponController.addCoupon);
adminRoute.post('/addCouponPost', adminAuth.isLoggedIn, couponController.addCouponPost);
adminRoute.get('/editCoupon', adminAuth.isLoggedIn, couponController.editCoupon);
adminRoute.post('/editCouponPost', adminAuth.isLoggedIn, couponController.editCouponPost);
adminRoute.get('/hideCoupon', adminAuth.isLoggedIn, couponController.hideCoupon);
adminRoute.get('/showCoupon', adminAuth.isLoggedIn, couponController.showCoupon);

//sales report
adminRoute.get('/salesReport', adminAuth.isLoggedIn, adminController.salesReport);
adminRoute.get('/sort', adminAuth.isLoggedIn, adminController.sort);
adminRoute.get('/download', adminAuth.isLoggedIn, adminController.downloadReport);

//category offer management
adminRoute.get('/categoryOffer', adminAuth.isLoggedIn, offerController.categoryOffer);
adminRoute.get('/addCategoryOffer', adminAuth.isLoggedIn, offerController.addCategoryOffer);
adminRoute.post('/addCategoryOfferPost', adminAuth.isLoggedIn, offerController.addCategoryOfferPost);
adminRoute.get('/editCategoryOffer', adminAuth.isLoggedIn, offerController.editCategoryOffer);
adminRoute.post('/editcategoryOfferPost', adminAuth.isLoggedIn, offerController.editCategoryOfferPost);
adminRoute.get('/hideCategoryOffer',adminAuth.isLoggedIn,offerController.hideCategoryOffer);
adminRoute.get('/showCategoryOffer',adminAuth.isLoggedIn,offerController.showCategoryOffer);

module.exports = adminRoute;
