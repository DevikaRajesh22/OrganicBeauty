const userController=require('../controllers/userController');
const express=require('express');
const userRoute=express();

//setting view engine
userRoute.set('views', './views');
userRoute.set('view engine', 'ejs');

//routes for users
userRoute.get('/',userController.loginGet);
userRoute.post('/login',userController.userLoginPost)
userRoute.get('/register',userController.registerGet);
userRoute.post('/registerPost',userController.registerPost);
userRoute.get('/landingPage',userController.landingPage);
userRoute.get('/products',userController.productsGet);
userRoute.get('/error',userController.error);

module.exports=userRoute;