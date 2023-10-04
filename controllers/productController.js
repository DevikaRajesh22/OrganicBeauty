const User=require('../models/user/userCollection');
const Category=require('../models/admin/categoryCollection');
const Product=require('../models/admin/productCollection');
const Sharp=require('sharp');

//product section GET request
exports.products = async (req, res) => {
    const products = await Product.find()
        .populate({
            path: 'category',
            select: 'categoryName'
        });
    try {
        res.render('admin/products', { products, });
    } catch (error) {
        console.log(error.message);
    }
};

//addProducts GET request
exports.addProducts = async (req, res) => {
    const categories = await Category.find();
    try {
        res.render('admin/addProducts', { categories });
    } catch (error) {
        console.log(error.message);
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
    }
};

//edit product get
//edit product post
//delete product get