const User = require('../models/user/userCollection');
const Cart = require('../models/user/cartCollection');
const Address=require('../models/user/addressCollection');
const Wishlist=require('../models/user/wishlistCollection');
const bcrypt = require('bcrypt');

//user account() GET request
exports.account = async (req, res) => {
    try {
        let wishlistCount=0;
        const wishlist=await Wishlist.findOne({user:req.session.userId});
        wishlist?wishlistCount=wishlist.products.length:0;
        const pageTitle = 'Account';
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
        res.render('user/account', { pageTitle, user: req.session.name, users, pageTitle, count, wishlistCount});
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user accountPost() POST request
exports.changePasswordPost = async (req, res) => {
    try {
        const pass = req.body.currentpassword;
        const newPass = req.body.newpassword;
        const conPass = req.body.confirmpassword;
        const userId = req.session.userId;
        const user = await User.findOne({ _id: userId });
        const hashPass = user.spassword;
        if (newPass === conPass) {
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
        res.render('user/error');
    }
};

//user changePassword() GET request
exports.changePassword = async (req, res) => {
    try {
        let wishlistCount=0;
        const wishlist=await Wishlist.findOne({user:req.session.userId});
        wishlist?wishlistCount=wishlist.products.length:0;
        const userId = req.session.userId;
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        const pageTitle = 'Account';
        res.render('user/changePassword', { pageTitle, user: req.session.name, count, wishlistCount });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user address() GET request
exports.address = async (req, res) => {
    try {
        const pageTitle = 'Address';
        let wishlistCount=0;
        const wishlist=await Wishlist.findOne({user:req.session.userId});
        wishlist?wishlistCount=wishlist.products.length:0;
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
            res.render('user/address', { pageTitle, user: req.session.name, addresses: addresses, number: req.session.phone, count,wishlistCount });
        } else {
            res.render('user/address', { pageTitle, user: req.session.name, addresses: undefined, number: req.session.phone, count, wishlistCount });
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user addAddress() GET request
exports.addAddress = async (req, res) => {
    try {
        let wishlistCount=0;
        const wishlist=await Wishlist.findOne({user:req.session.userId});
        wishlist?wishlistCount=wishlist.products.length:0;
        const pageTitle = 'Address';
        const userId = req.session.userId;
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        res.render('user/addAddress', { pageTitle, user: req.session.name, count, wishlistCount});
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user addAddressPost() POST request
exports.addAddressPost = async (req, res) => {
    try {
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
        res.redirect('/address');
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user deleteAddress() GET request
exports.deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
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
        res.redirect('/address');
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user editAdd() GET request
exports.editAdd=async(req,res)=>{
    try{
        let wishlistCount = 0;
        const wishlist = await Wishlist.findOne({ user: req.session.userId });
        wishlist ? wishlistCount = wishlist.products.length : 0;
        const pageTitle = 'Address';
        const userId = req.session.userId;
        const addressId=req.params.id;
        const addressData = await Address.findOne(
            { user: userId, "address._id": addressId },
            { "address.$": 1 }
        );
        const address = addressData.address[0];
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        res.render('user/editAdd', { user: req.session.name, address, pageTitle, count, wishlistCount });
    }catch(error){
        console.log(error.message);
        res.render('user/error');
    }
};

//user editAddPost() POST request
exports.editAddPost=async(req,res)=>{
    try{
        const userId=req.session.userId;
        const addressId=req.body.id;
        const { country, state, apartment, city, street, zipcode, type } = req.body;
        const updatedAddress = await Address.updateOne(
            { user: userId, 'address._id': addressId },
            {
                $set: {
                    "address.$.country": country,
                    "address.$.state": state,
                    "address.$.apartment": apartment,
                    "address.$.city": city,
                    "address.$.street": street,
                    "address.$.zipcode": zipcode,
                    "address.$.type": type,

                },
            },
        );
        res.redirect('/address');
    }catch(error){
        console.log(error.message);
        res.render('user/error');
    }
};