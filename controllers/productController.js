const User = require('../models/user/userCollection');
const Category = require('../models/admin/categoryCollection');
const Product = require('../models/admin/productCollection');

//admin products() GET request
exports.products = async (req, res) => {
    try {
        const pageName = 'Product Management';
        const products = await Product.find()
            .populate({
                path: 'category',
                select: 'categoryName'
            });
        res.render('admin/products', { products, pageName });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin addProducts() GET request
exports.addProducts = async (req, res) => {
    try {
        const pageName = 'Product Management';
        const categories = await Category.find();
        res.render('admin/addProducts', { categories, pageName });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin addProductsPost() POST request
exports.addProductsPost = async (req, res) => {
    try {
        const products = await Product.find();
        const files = await req.files;
        const newProduct = new Product({
            productName: req.body.pname,
            category: req.body.category,
            price: req.body.price,
            productDetails: req.body.pdetails,
            "image.image1": files.image1[0].filename,
            "image.image2": files.image2[0].filename,
            "image.image3": files.image3[0].filename,
            "image.image4": files.image4[0].filename,
            stock: req.body.stock
        });
        const productData = await newProduct.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//user editProduct() GET request
exports.editProduct = async (req, res) => {
    try {
        const pageName = 'Product Management';
        const pid = req.query.id;
        const categories = await Category.find();
        const pinfo = await Product.findById({ _id: pid });
        res.render('admin/editProduct', { pinfo, categories, pageName });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//user editProductPost() POST request
exports.editProductPost = async (req, res) => {
    try {
        const { productName, category, price, productDetails, stock, id } = req.body;
        let imageFiles = req.files || {};
        const data = await Product.findById({ _id: id });
        let image1 = data.image.image1;
        let image2 = data.image.image2;
        let image3 = data.image.image3;
        let image4 = data.image.image4;
        if (imageFiles && Object.keys(imageFiles).length > 0) {
            image1 = imageFiles.image1 ? imageFiles.image1[0].filename : data.image.image1;
            image2 = imageFiles.image2 ? imageFiles.image2[0].filename : data.image.image2;
            image3 = imageFiles.image3 ? imageFiles.image3[0].filename : data.image.image3;
            image4 = imageFiles.image4 ? imageFiles.image4[0].filename : data.image.image4;
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    productName: productName,
                    category: category,
                    price: price,
                    productDetails: productDetails,
                    'image.image1': image1,
                    'image.image2': image2,
                    'image.image3': image3,
                    'image.image4': image4,
                    stock: stock
                }
            }
        );
        res.render('admin/errors');
    } catch (error) {
        console.log(error.message);
    }
};


//user hideProduct() GET request
exports.hideProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedProduct = await Product.updateOne({ _id: productId }, { isList: false });
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//user showProduct() GET request
exports.showProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedProduct = await Product.updateOne({ _id: productId }, { isList: true });
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};