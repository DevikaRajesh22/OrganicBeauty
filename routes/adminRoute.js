const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const adminOrderController=require('../controllers/adminOrderController');
const adminCouponController=require('../controllers/adminCouponController');
const adminAuth=require('../middleware/adminAuth');
const express = require('express');
const adminRoute = express();
const multer = require('../middleware/multer');

//setting view engine
adminRoute.set('views', './views');
adminRoute.set('view engine', 'ejs');

//admin routes
adminRoute.get('/', adminController.loginGet);
adminRoute.post('/login', adminAuth.isLoggedOut,adminController.loginPost);
adminRoute.get('/landing', adminAuth.isLoggedIn, adminController.landing);
adminRoute.get('/errors', adminController.errors);
adminRoute.get('/signout',adminController.signout);

//user management
adminRoute.get('/users', adminAuth.isLoggedIn, adminController.users);
adminRoute.get('/block/:id', adminAuth.isLoggedIn, adminController.blockUser);
adminRoute.get('/unblock/:id', adminAuth.isLoggedIn, adminController.unblockUser);

//product management
adminRoute.get('/products', adminAuth.isLoggedIn, productController.products);
adminRoute.get('/addProducts', adminAuth.isLoggedIn, productController.addProducts);
adminRoute.post('/addProducts', multer.upload.array('image', 4), productController.addProductsPost);
adminRoute.get('/pedit', adminAuth.isLoggedIn, productController.editProduct);
adminRoute.post('/pedit', multer.upload.fields([{name:"image1",maxCount:1},{name:"image2",maxCount:1},{name:"image3",maxCount:1},{name:"image4",maxCount:1}]), productController.editProductPost);
adminRoute.get('/hide/:id',productController.hideProduct);
adminRoute.get('/show/:id',productController.showProduct);

//category management
adminRoute.get('/category', adminAuth.isLoggedIn, categoryController.category);
adminRoute.get('/addCategory', adminAuth.isLoggedIn, categoryController.addCategory);
adminRoute.post('/addCategoryPost', categoryController.addCategoryPost);
adminRoute.get('/cblock', categoryController.blockCategory);
adminRoute.get('/cunblock', categoryController.unblockCategory);
adminRoute.get('/cedit', categoryController.editCategory);
adminRoute.post('/cedit', categoryController.editCategoryPost);

//order management
adminRoute.get('/ordersAdmin', adminAuth.isLoggedIn, adminOrderController.orderGet);
adminRoute.post('/updateStatus',adminOrderController.updateStatus);
adminRoute.get('/orderDetails', adminAuth.isLoggedIn, adminOrderController.orderDetails);

//coupon management
adminRoute.get('/coupon', adminAuth.isLoggedIn, adminCouponController.coupon);
adminRoute.get('/addCoupon', adminAuth.isLoggedIn, adminCouponController.addCoupon);
adminRoute.post('/addCouponPost',adminCouponController.addCouponPost);
adminRoute.get('/editCoupon', adminAuth.isLoggedIn, adminCouponController.editCoupon);
adminRoute.post('/editCouponPost',adminCouponController.editCouponPost);
adminRoute.get('/hideCoupon',adminCouponController.hideCoupon);
adminRoute.get('/showCoupon',adminCouponController.showCoupon);

//sales report
adminRoute.get('/salesReport', adminAuth.isLoggedIn, adminController.salesReport);

module.exports = adminRoute;
