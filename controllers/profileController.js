const Cart = require('../models/user/cartCollection');
const Product = require('../models/admin/productCollection');
const User = require('../models/user/userCollection');
const Category = require('../models/admin/categoryCollection');

exports.profile=async(req,res)=>{
    try{
        const pageName='Profile';
        res.render('user/profile',pageName);
    }catch(error){
        console.log(error.message);
    }
};