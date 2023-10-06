const Category = require('../models/admin/categoryCollection');
const User = require('../models/user/userCollection');
const Product = require('../models/admin/productCollection');

//category GET request
let categoryData;
exports.category = async (req, res) => {
    const pageName = 'Category Management';
    const category = await Category.find()
        .populate({
            path: 'category',
            select: 'categoryName'
        });
    console.log(category);
    try {
        res.render('admin/category', { category, categoryData, pageName });
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/errors');
    }
};

//addCategory GET request
exports.addCategory = async (req, res) => {
    try {
        const pageName = 'Category Management';
        res.render('admin/addCategory', { pageName });
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/errors');
    }
};

//addCategoryPost POST request
exports.addCategoryPost = async (req, res) => {
    try {
        let { cname, description } = req.body;
        console.log(req.body);
        const newCategory = new Category({
            categoryName: cname,
            categoryDescription: description,
        });
        const categoryData = await newCategory.save();
        res.redirect('/admin/category');
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/errors');
    }
};

//blockCategory GET request
exports.blockCategory = async (req, res) => {
    try {
        const categoryId = req.query.id;
        console.log(categoryId);
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
        res.redirect('/admin/errors');
    }
};

//unblockCategory GET request
exports.unblockCategory = async (req, res) => {
    try {
        const categoryId = req.query.id;
        console.log(categoryId);
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
        res.redirect('/admin/errors');
    }
};

//editCategory GET request
exports.editCategory = async (req, res) => {
    try {
        const pageName = 'Category Management';
        const cid = req.query.id;
        console.log(cid);
        const cinfo = await Category.findById({ _id: cid });
        res.render('admin/editCategory', { cinfo, pageName });
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/errors');
    }
};

//editCategory POST request
exports.editCategoryPost = async (req, res) => {
    console.log('editCategoryPost');
    const categoryId = req.body.id;
    const updatedCategoryData = {
        categoryName: req.body.cname,
        categoryDescription: req.body.cdesc
    };
    try {
        await Category.findByIdAndUpdate(categoryId, updatedCategoryData);
        res.redirect('/admin/category');
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/errors');
    }
};