const User = require('../models/user/userCollection');
const Address = require('../models/user/addressCollection');
const Cart = require('../models/user/cartCollection');
const Category = require('../models/admin/categoryCollection');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require('nodemailer');
const Product = require('../models/admin/productCollection');
const { log } = require('console');
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
}

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
        res.render('user/userLogin', { emailErr,passwordErr });
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
                console.log('a');
                req.app.locals.passwordErr = "Incorrect password or email";
                return res.redirect('/login');
            }else if(user.isBlocked){
                console.log('b');
                req.app.locals.passwordErr="User is blocked!!";
                return res.redirect('/login');
            }else if(!user.isVerified){
                console.log('c');
                req.app.locals.passwordErr="Unverified user";
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
    }
};


var emailId;

//forgotPasswordPost() POST request
exports.forgotPasswordPost = async (req, res) => {
    try {
        // console.log('forgot password post request');
        emailId = req.body.email;
        // console.log(emailId);
        const user = await User.findOne({ email: emailId });
        // console.log(user);
        if (user) {
            res.redirect('/forgotPasswordChange');
        } else {
            res.redirect('/forgotPassword');
        }
    } catch (error) {
        console.log(error.message);
    }
};

//forgotPasswordChange() GET request
exports.forgotPasswordChange = async (req, res) => {
    try {
        res.render('user/forgotPasswordChange');
    } catch (error) {
        console.log(error.message);
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
            console.log('password doesnt match');
            return res.redirect('/forgotPasswordChange');
        }
        res.redirect('/login');
    } catch (error) {
        console.log(error.message);
    }
};

//registerGet for GET request
exports.registerGet = async (req, res) => {
    try {
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
        console.log('registerPost' + randomNumber);
        const spassword = await securePassword(req.body.spassword);
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            number: req.body.number,
            spassword: spassword
        });
        console.log(req.body);
        const userData = await newUser.save();
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
        // res.render('user/error');
    }
};

//landingPage for GET request
exports.landingPage = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findOne({ _id: userId });
        const carts = await Cart?.findOne({ userId: userId });
        const pageTitle = 'Home';
        let count = 0;
        const products = await Product.find();
        if (carts) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }

        res.render('user/landingPage', { products, pageTitle, count, user: req.session.name });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//productsGet GET request
exports.productsGet = async (req, res) => {
    try {
        console.log('productsGet request');
        const userId = req.session.userId;
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        const pageTitle = 'Products';
        const products = await Product.find();
        console.log(req.session.name);
        res.render('user/products', { pageTitle, products, count, user: req.session.name });
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
        res.render('user/error');
        console.log(error.message);
    }
};

//productDetails GET request
exports.productDetails = async (req, res) => {
    try {
        const productId = req.query.id;
        const userId = req.session.userId;
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        const products = await Product.findOne({ _id: productId });
        const categoryId = products.category;
        const categories = await Category.findOne({ _id: categoryId });
        const pageTitle = 'Product';
        res.render('user/productDetails', { pageTitle, products, count, user: req.session.name, categories });
    } catch (error) {
        console.log(error.message);
    }
};

//about GET request
exports.about = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findOne({ _id: userId });
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        const pageTitle = 'About';
        res.render('user/about', { pageTitle, user: req.session.name, count });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//contact GET request
exports.contact = async (req, res) => {
    try {
        const pageTitle = 'contact';
        const userId = req.session.userId;
        const carts = await Cart.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        res.render('user/contact', { pageTitle, user: req.session.name, count });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//account() GET request
exports.account = async (req, res) => {
    try {
        const pageTitle = 'Account';
        console.log('account get request');
        const userId = req.session.userId;
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        if (userId === undefined) {
            return res.redirect('/login');
        }
        const users = await User.findOne({ _id: userId });
        if (!users) {
            res.redirect('/login');
        }
        console.log(users);
        res.render('user/account', { pageTitle, user: req.session.name, users, pageTitle, count });
    } catch (error) {
        console.log(error.message);
    }
};

//accountPost() POST request
exports.accountPost = async (req, res) => {
    try {
        const pass = req.body.currentpassword;
        const newPass = req.body.newpassword;
        const conPass = req.body.confirmpassword;
        const userId = req.session.userId;
        const user = await User.findOne({ _id: userId });
        const hashPass = user.spassword;
        if (newPass === conPass) {
            console.log('newpass and conpass match');
            const same = await bcrypt.compare(pass, hashPass);
            const updatedPassword = await bcrypt.hash(newPass, 10);
            if (same) {
                const updateResult = await User.updateOne({ _id: userId }, { $set: { spassword: updatedPassword } });
                res.redirect('/account');
            } else {
                console.log("password doesnt match");
            }
        } else {
            console.log('newpass and conpass doesnt match');
        }
    } catch (error) {
        console.log(error.message);
    }
};

//changePassword() GET request
exports.changePassword = async (req, res) => {
    try {
        console.log('change password get');
        const userId = req.session.userId;
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        const pageTitle = 'Account';
        res.render('user/changePassword', { pageTitle, user: req.session.name, count });
    } catch (error) {
        console.log(error.message);
    }
}

//address() GET request
exports.address = async (req, res) => {
    try {
        const pageTitle = 'Address';
        const userId = req.session.userId;
        if (userId === undefined) {
            res.redirect('/login');
        }
        const addresses = await Address.findOne({ user: userId });
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        if (addresses != null) {
            res.render('user/address', { pageTitle, user: req.session.name, addresses: addresses, number: req.session.phone, count });
        } else {
            res.render('user/address', { pageTitle, user: req.session.name, addresses: undefined, number: req.session.phone, count });
        }
    } catch (error) {
        console.log(error.message);
    }
};

//addAddress() GET request
exports.addAddress = async (req, res) => {
    try {
        console.log('req received at addAddress get')
        const pageTitle = 'Address';
        const userId = req.session.userId;
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        res.render('user/addAddress', { pageTitle, user: req.session.name, count });
    } catch (error) {
        console.log(error.message);
    }
};

//addAddressPost() POST request
exports.addAddressPost = async (req, res) => {
    try {
        console.log('post req received at addAddressPost');
        const userId = req.session.userId;
        const address = await Address.findOne({ user: userId });
        if (!address) {
            const newAddress = new Address({
                user: userId,
                address: {
                    country: req.body.country,
                    state: req.body.state,
                    apartment: req.body.apartment,
                    city: req.body.city,
                    street: req.body.street,
                    zipcode: req.body.zipcode,
                    type: req.body.type,
                },
            });
            const addressData = await newAddress.save();
        } else {
            await Address.updateOne({ user: userId }, {
                $push: {
                    address: {
                        country: req.body.country,
                        state: req.body.state,
                        apartment: req.body.apartment,
                        city: req.body.city,
                        street: req.body.street,
                        zipcode: req.body.zipcode,
                        type: req.body.type,
                    }
                }
            })
        }
        console.log(req.body);
        res.redirect('/address');
    } catch (error) {
        console.log(error.message);
    }
};

//deleteAddress() GET request
exports.deleteAddress = async (req, res) => {
    try {
        console.log('deleteAddress get request')
        const addressId = req.params.id;
        console.log(addressId);
        const userId = req.session.userId;
        const delAdd = await Address.updateOne(
            { user: userId },
            {
                $pull: {
                    address: {
                        _id: addressId
                    }
                }
            }
        );
        console.log(delAdd)
        res.redirect('/address');
    } catch (error) {
        console.log(error.message);
    }
};

//wallet() GET request
exports.wallet = async (req, res) => {
    try {
        const pageTitle = 'Wallet';
        const userId = req.session.userId;
        const carts = await Cart.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        res.render('user/wallet', { user: req.session.name, pageTitle, count });
    } catch (error) {
        console.log(error.message);
    }
};

//wishlist() GET request
exports.wishlist = async (req, res) => {
    try {
        const pageTitle = 'Wishlist';
        const userId = req.session.userId;
        const carts = await Cart.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        res.render('user/wishlist', { user: req.session.name, pageTitle, count });
    } catch (error) {
        console.log(error.message);
    }
};

//search() POST request
// exports.search=async(req,res)=>{
//     try{
//         const searchTerm=req.body.searchTerm;
//         const results= await Product.find({productName:{$regex:new RegExp(searchTerm,'i')}});
//         res.render('user/products');
//     }catch(error){
//         console.log(error.message);
//     }
// };
