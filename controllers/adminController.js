const Admin = require('../models/admin/adminCollection');
const User = require('../models/user/userCollection');
const Product = require('../models/admin/productCollection');
const Category = require('../models/admin/categoryCollection');
const multer = require('multer');
const Sharp = require('sharp');

//loginGet for GET request
exports.loginGet = async (req, res) => {
    try {
        res.render('admin/adminLogin');
    } catch (error) {
        res.render('admin/error');
        console.log(error.message);
    }
};

//loginPost for POST request
exports.loginPost = async (req, res) => {
    try {
        const admin = await Admin.findOne({ email: req.body.email });
        if (admin.email == req.body.email && admin.password == req.body.password) {
            req.session.admin = admin.email;
            res.render('admin/landingPage');
        }
    } catch (error) {
        res.render('admin/error');
        console.log(error.message);
    }
};

//users GET request
exports.users = async (req, res) => {
    try {
        const users = await User.find();
        res.render('admin/users', { users });
    } catch (error) {
        console.log(error.message);
    }
};

//blockUser POST request
exports.blockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            // return res.status(404).json({ message: 'User not found' });
            console.log('blockUser: user not found')
        } else {
            user.isBlocked = true;
            await user.save();
            res.redirect('/admin/users');
        }

    } catch (error) {
        // return res.status(500).json({ error: 'Internal Server Error' });
        console.log('blockuser: internal server error')
    }
};

//unblockUser POST request
exports.unblockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            // return res.status(404).json({ message: 'User not found' });
            console.log('unblockUser: user not found')
        } else {
            user.isBlocked = false;
            await user.save();
            res.redirect('/admin/users');
        }
    } catch (error) {
        // return res.status(500).json({ error: 'Internal Server Error' });
        console.log('unblockUser: internal server error');
    }
};