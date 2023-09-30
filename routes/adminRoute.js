const adminController=require('../controllers/adminController');
const express=require('express');
const adminRoute=express();

//setting view engine
adminRoute.set('views', './views');
adminRoute.set('view engine', 'ejs');

//routes for admin
adminRoute.get('/admin',adminController.loginGet);

module.exports = adminRoute;
