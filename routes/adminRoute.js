const adminController=require('../controllers/adminController');
const productController=require('../controllers/productController');
const express=require('express');
const adminRoute=express();

//setting view engine
adminRoute.set('views', './views');
adminRoute.set('view engine', 'ejs');

//routes for admin
adminRoute.get('/',adminController.loginGet);
adminRoute.post('/login',adminController.loginPost);

module.exports = adminRoute;
