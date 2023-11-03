const User = require('../models/user/userCollection');
const Cart = require('../models/user/cartCollection');
const Address=require('../models/user/addressCollection');
const bcrypt = require('bcrypt');

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
exports.changePasswordPost = async (req, res) => {
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
};

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