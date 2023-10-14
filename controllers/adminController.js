const Admin = require('../models/admin/adminCollection');
const User = require('../models/user/userCollection');
const Product = require('../models/admin/productCollection');
const Category = require('../models/admin/categoryCollection');
const multer = require('multer');
const Sharp = require('sharp');

//loginGet for GET request
exports.loginGet = async (req, res) => {
    try {
        req.app.locals.err = "";
       const err =  req.app.locals.err;
        res.render('admin/adminLogin',{err});
    } catch (error) {
        res.redirect('/admin/errors');
        console.log(error.message);
    }
};

//loginPost for POST request
exports.loginPost = async (req, res) => {
    try {
        const pageName='User Management';
        const admin = await Admin.findOne({ email: req.body.email });
        if (admin.email == req.body.email && admin.password == req.body.password) {
            req.session.admin = admin.email;
            res.render('admin/landing',{pageName,admin:req.session.admin});
        }else if(admin.email !== req.body.email || admin.password !== req.body.password){
            req.app.locals.err = 'Invalid credentials';
            res.redirect('/');
        }
    } catch (error) {
        res.redirect('/admin/errors');
        console.log(error.message);
    }
};

//landing GET request
exports.landing=async(req,res)=>{
    const pageName='Home';
    try{
        res.render('admin/landing',{pageName});
    }catch(error){
        console.log(error.message);
    }
};

//error GET request
exports.errors = async (req, res) => {
    const pageName = 'Error';
    res.render('admin/errors', { pageName });
};

//signout GET request
exports.signout=async(req,res)=>{
    try{
        req.session.destroy(err=>{
            if(err){
                console.error('Error destroying session:',err);
            }
            res.redirect('/admin/');
        });
    }catch(error){
        res.redirect('/admin/errors');
        console.log(error.message);
    }
}

//users GET request
exports.users = async (req, res) => {
    try {
        const pageName = 'User management';
        const users = await User.find();
        res.render('admin/users', { users, pageName });
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/errors');
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
        console.log('blockuser: internal server error');
        res.redirect('/admin/errors');
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
        res.redirect('/admin/errors');
    }
};