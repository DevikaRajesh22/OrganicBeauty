const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const orderController=require('../controllers/orderController');
const express = require('express');
const adminRoute = express();
const multer = require('../middleware/multer');

//setting view engine
adminRoute.set('views', './views');
adminRoute.set('view engine', 'ejs');

//admin routes
adminRoute.get('/', adminController.loginGet);
adminRoute.post('/login', adminController.loginPost);
adminRoute.get('/landing',adminController.landing);
adminRoute.get('/errors', adminController.errors);
adminRoute.get('/signout',adminController.signout);

//user management
adminRoute.get('/users', adminController.users);
adminRoute.get('/block/:id', adminController.blockUser);
adminRoute.get('/unblock/:id', adminController.unblockUser);

//product management
adminRoute.get('/products', productController.products);
adminRoute.get('/addProducts', productController.addProducts);
adminRoute.post('/addProducts', multer.upload.array('image', 4), productController.addProductsPost);
adminRoute.get('/pedit', productController.editProduct);
adminRoute.post('/pedit', productController.editProductPost);
adminRoute.get('/pdelete/:id', productController.deleteProduct);

//category management
adminRoute.get('/category', categoryController.category);
adminRoute.get('/addCategory', categoryController.addCategory);
adminRoute.post('/addCategoryPost', categoryController.addCategoryPost);
adminRoute.get('/cblock', categoryController.blockCategory);
adminRoute.get('/cunblock', categoryController.unblockCategory);
adminRoute.get('/cedit', categoryController.editCategory);
adminRoute.post('/cedit', categoryController.editCategoryPost);

//order management
adminRoute.get('/orders',orderController.orders);

module.exports = adminRoute;
