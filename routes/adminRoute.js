const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const orderController=require('../controllers/orderController');
const couponController=require('../controllers/couponController');
const adminAuth=require('../middleware/adminAuth');
const express = require('express');
const adminRoute = express();
const multer = require('../middleware/multer');

//setting view engine
adminRoute.set('views', './views');
adminRoute.set('view engine', 'ejs');

//admin routes
adminRoute.get('/', adminController.loginGet);
adminRoute.post('/login', adminController.loginPost);
adminRoute.get('/landing', adminController.landing);
adminRoute.get('/errors', adminController.errors);
adminRoute.get('/signout',adminController.signout);

//user management
adminRoute.get('/users', adminController.users);
adminRoute.get('/block/:id', adminController.blockUser);
adminRoute.get('/unblock/:id', adminController.unblockUser);

//product management
adminRoute.get('/products', productController.products);
adminRoute.get('/addProducts', productController.addProducts);
adminRoute.post('/addproducts',multer.upload.fields([{name : "image1", maxCount : 1},{name : "image2", maxCount : 1},{name : "image3", maxCount : 1},{name : "image4", maxCount : 1}]),productController.addProductsPost);
adminRoute.get('/pedit', productController.editProduct);
adminRoute.post('/pedit', multer.upload.fields([{name:"image1",maxCount:1},{name:"image2",maxCount:1},{name:"image3",maxCount:1},{name:"image4",maxCount:1}]), productController.editProductPost);
adminRoute.get('/hide/:id',productController.hideProduct);
adminRoute.get('/show/:id',productController.showProduct);

//category management
adminRoute.get('/category', categoryController.category);
adminRoute.get('/addCategory', categoryController.addCategory);
adminRoute.post('/addCategoryPost', categoryController.addCategoryPost);
adminRoute.get('/cblock', categoryController.blockCategory);
adminRoute.get('/cunblock', categoryController.unblockCategory);
adminRoute.get('/cedit', categoryController.editCategory);
adminRoute.post('/cedit', categoryController.editCategoryPost);

//order management
adminRoute.get('/ordersAdmin', orderController.orderGet);
adminRoute.post('/updateStatus',orderController.updateStatus);
adminRoute.get('/orderDetails', orderController.orderDetails);

//coupon management
adminRoute.get('/coupon', couponController.coupon);
adminRoute.get('/addCoupon', couponController.addCoupon);
adminRoute.post('/addCouponPost',couponController.addCouponPost);
adminRoute.get('/editCoupon', couponController.editCoupon);
adminRoute.post('/editCouponPost',couponController.editCouponPost);
adminRoute.get('/hideCoupon',couponController.hideCoupon);
adminRoute.get('/showCoupon',couponController.showCoupon);

//sales report
adminRoute.get('/salesReport', adminController.salesReport);

module.exports = adminRoute;
