const Wishlist = require('../models/user/wishlistCollection');
const Cart = require('../models/user/cartCollection');
const User = require('../models/user/userCollection');
const Offer = require('../models/admin/offerCollection');
const Category = require('../models/admin/categoryCollection');

//user referral() GET request
exports.referral = async (req, res) => {
    try {
        const pageTitle = 'Referral Offer';
        let wishlistCount = 0;
        const wishlist = await Wishlist.findOne({ user: req.session.userId });
        wishlist ? wishlistCount = wishlist.products.length : 0;
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
        const userData = await User.findOne({ _id: req.session.userId });
        const referral = userData.referralCode;
        res.render('user/referral', { pageTitle, user: req.session.name, pageTitle, count, wishlistCount, referral })
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//admin categoryOffer() GET request
exports.categoryOffer = async (req, res) => {
    try {
        const pageName = 'Category Offers';
        const offerData = await Offer.find().populate('category');
        let pageNum = req.query.pageNum;
        let perPage = 8;
        const offerCount = await Offer.countDocuments();
        let page = Math.ceil(offerCount / perPage);
        res.render('admin/categoryOffer', { pageName, admin: req.session.admin, offerData, page });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin addCategoryOffer() GET request
exports.addCategoryOffer = async (req, res) => {
    try {
        const pageName = "Add offer";
        const categories = await Category.find();
        res.render('admin/addCategoryOffer', { pageName, categories, admin: req.session.admin });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin addCategoryOfferPost() POST request
exports.addCategoryOfferPost = async (req, res) => {
    try {
        console.log('addCategoryPost');
        const { offerName, discountAmount, activationDate, expiryDate, category } = req.body;
        let currentDate = new Date();
        currentDate = currentDate.toISOString().split('T')[0];
        const categoryFound = await Offer.findOne({ category: category });
        if (activationDate < currentDate || expiryDate <= currentDate) {
            res.json({ dateValidation: true });
        } else if (categoryFound) {
            res.json({ duplicate: true });
        }else if(discountAmount<=0){
            res.json({priceValidation:true});
        } else {
            const newCategoryOffer = new Offer({
                offerName: offerName,
                discountAmount: discountAmount,
                activationDate: activationDate,
                expiryDate: expiryDate,
                category: category
            });
            await newCategoryOffer.save();
            return res.json({ success: true });
        }
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin productOffer() GET request
exports.productOffer = async (req, res) => {
    try {
        const pageName = 'Product Offers';
        res.render('admin/productOffer', { pageName, admin: req.session.admin });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};