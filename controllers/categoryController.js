const Category = require('../models/admin/categoryCollection');
const User = require('../models/user/userCollection');
const Product = require('../models/admin/productCollection');

//category GET request
let categoryData;
exports.category = async (req, res) => {
    try {
        const pageName = 'Category Management';
        const category = await Category.find()
            .populate({
                path: 'category',
                select: 'categoryName'
            });
        res.render('admin/category', { category, categoryData, pageName });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//addCategory GET request
exports.addCategory = async (req, res) => {
    try {
        const pageName = 'Category Management';
        res.render('admin/addCategory', { pageName });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//addCategoryPost POST request
exports.addCategoryPost = async (req, res) => {
    try {
        const categoryName = req.body.categoryName;
        const categoryDescription = req.body.categoryDescription;
        const categoryFound = await Category.findOne({ categoryName: { $regex: new RegExp(categoryName, 'i') } });
        if (categoryFound) {
            res.json({ duplicate: true });
        } else {
            const newCategory = new Category({
                categoryName: categoryName,
                categoryDescription: categoryDescription,
            });
            await newCategory.save();
            res.json({success:true});
        }
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//blockCategory GET request
exports.blockCategory = async (req, res) => {
    try {
        const categoryId = req.query.id;
        const category = await Category.findById(categoryId);
        if (!category) {
            console.log('blockCategory: category not found');
        } else {
            category.isBlocked = true;
            await category.save();
            res.redirect('/admin/category');
        }
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//unblockCategory GET request
exports.unblockCategory = async (req, res) => {
    try {
        const categoryId = req.query.id;
        const category = await Category.findById(categoryId);
        if (!category) {
            console.log('unblockCategory: category not found');
        } else {
            category.isBlocked = false;
            await category.save();
            res.redirect('/admin/category');
        }
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//editCategory GET request
exports.editCategory = async (req, res) => {
    try {
        const pageName = 'Category Management';
        const cid = req.query.id;
        const cinfo = await Category.findById({ _id: cid });
        res.render('admin/editCategory', { cinfo, pageName });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//editCategory POST request
exports.editCategoryPost = async (req, res) => {
    try {
        const categoryId = req.body.id;
        const updatedCategoryData = {
            categoryName: req.body.cname,
            categoryDescription: req.body.cdesc
        };
        await Category.findByIdAndUpdate(categoryId, updatedCategoryData);
        res.redirect('/admin/category');
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};