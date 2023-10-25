const User = require('../models/user/userCollection');
const Category = require('../models/admin/categoryCollection');
const Product = require('../models/admin/productCollection');
const Sharp = require('sharp');

//product section GET request
exports.products = async (req, res) => {
    const pageName = 'Product Management';
    const products = await Product.find()
        .populate({
            path: 'category',
            select: 'categoryName'
        });
    try {
        res.render('admin/products', { products, pageName });
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/errors');
    }
};

//addProducts GET request
exports.addProducts = async (req, res) => {
    const pageName = 'Product Management';
    const categories = await Category.find();
    try {
        res.render('admin/addProducts', { categories, pageName });
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/errors');
    }
};

//addProducts POST request
exports.addProductsPost = async (req, res) => {
    const products = await Product.find();
    try {
        let img = [];
        console.log(req.files);
        for (let i = 0; i < req.files.length; i++) {
            img.push(req.files[i].filename);
            await Sharp('public/product/' + req.files[i].filename)
                .resize(500, 500)
                .toFile('public/product/img/' + req.files[i].filename);
        }
        const newProduct = new Product({
            productName: req.body.pname,
            category: req.body.category,
            price: req.body.price,
            productDetails: req.body.pdetails,
            productImage: img,
            stock: req.body.stock
        });
        console.log(req.body);
        const productData = await newProduct.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/errors');
    }
};

//editProduct GET request
exports.editProduct = async (req, res) => {
    const pageName = 'Product Management';
    const pid = req.query.id;
    console.log(pid);
    const categories = await Category.find();
    const pinfo = await Product.findById({ _id: pid });
    try {
        res.render('admin/editProduct', { pinfo, categories, pageName });
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/errors');
    }
};

//editProductPost POST request
exports.editProductPost = async (req, res) => {
    const productId = req.body.id;
    const updatedProductData = {
        productName: req.body.pname,
        category: req.body.category,
        price: req.body.price,
        productDetails: req.body.pdetails,
        productImage: req.body.pimage,
        stock: req.body.stock
    };
    try {
        await Product.findByIdAndUpdate(productId, updatedProductData);
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/errors');
    }
};

//hideProduct() GET request
exports.hideProduct=async(req,res)=>{
   try{
    const productId=req.params.id;
    const updatedProduct=await Product.updateOne({_id:productId},{isList:false});
    res.redirect('/admin/products');
   }catch(error){
    console.log(error.message);
   } 
};

//showProduct() GET request
exports.showProduct=async(req,res)=>{
    try{
     console.log('show product get request');
     const productId=req.params.id;
     const updatedProduct=await Product.updateOne({_id:productId},{isList:true});
     res.redirect('/admin/products');
    }catch(error){
     console.log(error.message);
    } 
 };