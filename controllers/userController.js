const User = require('../models/user/userCollection');
const Cart = require('../models/user/cartCollection');
const Category = require('../models/admin/categoryCollection');
const Product = require('../models/admin/productCollection');
const Wishlist = require('../models/user/wishlistCollection');
const Offer = require('../models/admin/offerCollection');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

//for otp using nodemailer
let randomNumber;
let emailOne;
const smtpConfig = {
    service: "Gmail",
    auth: {

        user: process.env.EMAIL,
        pass: process.env.PASS

    }
};

//for bcrypting password
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

//loginGet for GET request
exports.loginGet = async (req, res) => {
    try {
        let emailErr = req.app.locals.emailErr;
        req.app.locals.emailErr = " ";
        let passwordErr = req.app.locals.passwordErr;
        req.app.locals.passwordErr = " ";
        res.render('user/userLogin', { emailErr, passwordErr });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//userLoginPost for POST request
exports.userLoginPost = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({ email: email });
        if (!user) {
            req.app.locals.emailErr = " User not found!!!";
            return res.redirect("/login");
        }
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.spassword);
            if (passwordMatch && !user.isBlocked && user.isVerified) {
                //setting up user session
                req.session.userId = user._id;
                req.session.name = user.name;
                req.session.email = user.email;
                req.session.phone = user.number;
                return res.redirect("/"); //if password match then store user session and redirect to landingPage
            } else if (!passwordMatch) {
                req.app.locals.passwordErr = "Incorrect password or email!!";
                return res.redirect('/login');
            } else if (user.isBlocked) {
                req.app.locals.passwordErr = "User is blocked!!";
                return res.redirect('/login');
            } else if (!user.isVerified) {
                req.app.locals.passwordErr = "Unverified user!!";
                return res.redirect('/login');
            }
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//forgotPassword() GET request
exports.forgotPassword = async (req, res) => {
    try {
        const pageTitle = 'Password';
        res.render('user/forgotPassword', { pageTitle });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};


var emailId;

//forgotPasswordPost() POST request
exports.forgotPasswordPost = async (req, res) => {
    try {
        emailId = req.body.email;
        const user = await User.findOne({ email: emailId });
        if (user) {
            res.redirect('/forgotPasswordChange');
        } else {
            res.redirect('/forgotPassword');
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//forgotPasswordChange() GET request
exports.forgotPasswordChange = async (req, res) => {
    try {
        res.render('user/forgotPasswordChange');
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//forgotPasswordChangePost() POST request
exports.forgotPasswordChangePost = async (req, res) => {
    try {
        const curPassword = req.body.currentpassword;
        const newPassword = req.body.newpassword;
        const user = await User.findOne({ email: emailId });
        const hashPass = user.spassword;
        const same = await bcrypt.compare(curPassword, hashPass);
        const updatedPassword = await bcrypt.hash(newPassword, 10);
        if (same) {
            const updateResult = await User.updateOne({ email: emailId }, { $set: { spassword: updatedPassword } });
        } else {
            return res.redirect('/forgotPasswordChange');
        }
        res.redirect('/login');
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//registerGet for GET request
let referralCodeApplied;
exports.registerGet = async (req, res) => {
    try {
        referralCodeApplied = req.query.referralCode;
        res.render('user/register');
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//registerPost for POST request
exports.registerPost = async (req, res) => {
    try {
        const transporter = nodemailer.createTransport(smtpConfig);
        emailOne = req.body.email;
        randomNumber = Math.floor(Math.random() * 9000) + 1000;
        console.log('OTP : ' + randomNumber);
        const spassword = await securePassword(req.body.spassword);
        function generateReferralCode() {
            const timestamp = Date.now().toString(36);
            const randomChars = Math.random().toString(36).substr(2, 5);
            return timestamp + randomChars;
        }
        const code = generateReferralCode();
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            number: req.body.number,
            spassword: spassword,
            referralCode: code,
        });
        await newUser.save();
        if (referralCodeApplied) {
            const referUser = await User.findOne({ referralCode: referralCodeApplied });
            if (referUser) {
                referUser.wallet += 200;
                referUser.walletHistory.push({ status: 'Referral link', date: new Date(), amount: 200 });
                await referUser.save();
            }
            const user = await User.findOne({ referralCode: code });
            if (user) {
                user.wallet += 200;
                user.walletHistory.push({ status: 'Referral link', date: new Date(), amount: 200 });
                await user.save();
            }
        }
        req.app.locals.specialContext = 'Sign up successful! Please login';
        const mailOptions = {
            from: "devikaraj699@gmail.com",
            to: emailOne,
            subject: "Your OTP for signup",
            text: `Your OTP is ${randomNumber}`,
        };
        transporter.sendMail(mailOptions);
        res.render('user/otp');
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//landingPage for GET request
exports.landingPage = async (req, res) => {
    try {
        const userId = req.session.userId;
        let wishlistCount = 0;
        const wishlist = await Wishlist.findOne({ user: userId });
        wishlist ? wishlistCount = wishlist.products.length : 0;
        const carts = await Cart?.findOne({ userId: userId });
        const pageTitle = 'Home';
        let count = 0;
        if (carts) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        const productData = await Product.find().populate({
            path: 'category',
            populate: {
                path: 'offer',
            },
        });
        res.render('user/landingPage', { productData, pageTitle, count, user: req.session.name, wishlistCount });
    } catch (error) {
        console.log(error.message);
    }
};

//productsGet GET request
exports.productsGet = async (req, res) => {
    try {
        const pageTitle = 'Products';
        let wishlistCount = 0;
        const wishlist = await Wishlist.findOne({ user: req.session.userId });
        wishlist ? wishlistCount = wishlist.products.length : 0;
        let similar;
        let wishlistString = [];
        wishlist?.products.map((ele) => {
            wishlistString.push(ele.productId)
        })
        const userId = req.session.userId;
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        let sort = req.query.id;
        const searchTerm = req.query.searchTerm ? req.query.searchTerm : "";
        let pageNum = req.query.pageNum;
        let perPage = 8;
        let productCount = await Product.find().countDocuments();
        let page = Math.ceil(productCount / perPage);
        const items = await Product.find({
            isList: true,
            productName: { $regex: searchTerm, $options: "i" },
        })
            .skip((pageNum - 1) * perPage)
            .limit(perPage)
            .sort({ price: sort })
            .populate({
                path: 'category',
                populate: {
                    path: 'offer',
                },
            });
        const categories = await Category.find({ isBlocked: false });
        const categoryId = req.query.categoryFilter;
        if (categoryId !== undefined) {
            similar = await Product.find({ category: categoryId })
                .skip((pageNum - 1) * perPage)
                .limit(perPage)
                .populate({
                    path: 'category',
                    populate: {
                        path: 'offer',
                    },
                });
        }

        res.render('user/products', { pageTitle, count, items, user: req.session.name, searchTerm, categories, similar, wishlistString, wishlistCount, page });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//otp GET request
exports.otp = async (req, res) => {
    try {
        res.render('user/otp');
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//otp POST request
exports.otpPost = async (req, res) => {
    try {

        const { otp } = req.body;
        const user = await User.findOne({ email: emailOne });
        if (randomNumber == otp) {
            const verified = await User.updateOne(
                { email: emailOne },
                { $set: { isVerified: true } }
            );
            if (verified) {
                req.session.otp = otp;
                req.session.userId = user._id;
                req.session.name = user.name;
                res.redirect('/');
            } else {
                res.redirect('/otp');
            }
        } else {
            res.redirect('/otp');
        }

    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//logout GET request
exports.logout = async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            res.redirect('/login');
        });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//productDetails GET request
exports.productDetails = async (req, res) => {
    try {
        let wishlistCount = 0;
        const wishlist = await Wishlist.findOne({ user: req.session.userId });
        wishlist ? wishlistCount = wishlist.products.length : 0;
        let wishlistString = [];
        wishlist?.products.map((ele) => {
            wishlistString.push(ele.productId)
        })
        const productId = req.query.id;
        const userId = req.session.userId;
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        const products = await Product.findOne({ _id: productId }).populate({
            path: 'category',
            populate: {
                path: 'offer',
            },
        });
        const categoryId = products.category;
        const categories = await Category.findOne({ _id: categoryId });
        const pageTitle = 'Product';
        res.render('user/productDetails', { pageTitle, products, count, user: req.session.name, categories, wishlistString, wishlistCount });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//about GET request
exports.about = async (req, res) => {
    try {
        const userId = req.session.userId;
        let wishlistCount = 0;
        const wishlist = await Wishlist.findOne({ user: userId });
        wishlist ? wishlistCount = wishlist.products.length : 0;
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        const pageTitle = 'About';
        res.render('user/about', { pageTitle, user: req.session.name, count, wishlistCount });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user contact GET request
exports.contact = async (req, res) => {
    try {
        let wishlistCount = 0;
        const wishlist = await Wishlist.findOne({ user: req.session.userId });
        wishlist ? wishlistCount = wishlist.products.length : 0;
        const pageTitle = 'contact';
        const userId = req.session.userId;
        const carts = await Cart.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        res.render('user/contact', { pageTitle, user: req.session.name, count, wishlistCount });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

