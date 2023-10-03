const User=require('../models/user/userCollection');

//productsGet for GET request
exports.productsGet=async(req,res)=>{
    try{
        const pageTitle='Products';
        res.render('user/products',{pageTitle});
    }catch(error){
        console.log(error.message);
        res.render('user/error');
    }
};
