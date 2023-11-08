const Admin = require('../models/admin/adminCollection');
const User = require('../models/user/userCollection');
const Product = require('../models/admin/productCollection');
const Order = require('../models/user/orderCollection');
const Category = require('../models/admin/categoryCollection');
const multer = require('multer');
const Sharp = require('sharp');

//loginGet for GET request
exports.loginGet = async (req, res) => {
    try {
        let adminEmailErr = req.app.locals.adminEmailErr;
        req.app.locals.adminEmailErr = " ";
        let adminPasswordErr = req.app.locals.adminPasswordErr;
        req.app.locals.adminPasswordErr = " ";
        res.render('admin/adminLogin', { adminEmailErr, adminPasswordErr });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//loginPost for POST request
exports.loginPost = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email: email });
        if (admin) {
            if (admin.email == req.body.email && admin.password == req.body.password) {
                req.session.admin = admin.email;
                res.redirect('/admin/landing');
            } else if (admin.email !== req.body.email) {
                req.app.locals.adminEmailErr = 'Invalid email!';
                res.redirect('/admin');
            } else if (admin.password !== req.body.password) {
                req.app.locals.adminPasswordErr = 'Invalid Password!';
                res.redirect('/admin');
            }
        }
        else {
            req.app.locals.adminEmailErr = 'User doesnt exist!';
            res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//landing GET request
exports.landing = async (req, res) => {
    try {
        const pageName = 'Dashboard';
        const productCount = await Product.countDocuments();
        const userCount = await User.countDocuments();
        const categoryCount = await Category.countDocuments();
        const orderCount = await Order.countDocuments();
        const lastTenOrders = await Order.find().sort({ orderId: -1 }).limit(10);
        //paymentChart
        let Payment = await Order.aggregate([
            {
                $match: {
                    "status": "Delivered"
                }
            },
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 }
                }
            }
        ]);
        let onlinePaymentCount = 0;
        let cashPaymentCount = 0;
        let walletPaymentCount = 0;
        if (Payment.length > 0) {
            const onlinePayment = Payment.find(payment => payment._id === "Online payment");
            const cashPayment = Payment.find(payment => payment._id === "Cash on delivery");
            const walletPayment = Payment.find(payment => payment._id === "Wallet");
            if (onlinePayment) onlinePaymentCount = onlinePayment.count || 0;
            if (cashPayment) cashPaymentCount = cashPayment.count || 0;
            if (walletPayment) walletPaymentCount = walletPayment.count || 0;
        }
        res.render('admin/landing', { pageName, productCount, userCount, categoryCount, orderCount, admin: req.session.admin, lastTenOrders, onlinePaymentCount, cashPaymentCount, walletPaymentCount });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//signout GET request
exports.signout = async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            res.redirect('/admin/');
        });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
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
        res.render('admin/errors');
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
        console.log(error.message);
        res.render('admin/errors');
    }
};

//unblockUser POST request
exports.unblockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            console.log('unblockUser: user not found')
        } else {
            user.isBlocked = false;
            await user.save();
            res.redirect('/admin/users');
        }
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//salesReport() GET request
exports.salesReport = async (req, res) => {
    try {
        const pageName = 'Sales Report';
        res.render('admin/salesReport', { pageName });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};