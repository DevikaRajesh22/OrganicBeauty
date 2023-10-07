const Cart=require('../models/user/cartCollection');
const Product=require('../models/admin/productCollection');
const User=require('../models/user/userCollection');
const Category=require('../models/admin/categoryCollection');

//cartGet() GET request
exports.cartGet=async(req,res)=>{
    try{
        const pageTitle='Cart';
        res.render('user/cart',{pageTitle});
    }catch(error){
        console.log(error);
    }
};

//addToCartPost() POST request
exports.addToCartPost=async(req,res)=>{
    try{
        const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
        return res.redirect('/products');
      }
    }catch(error){
        console.log(error.message);
    }
    
};