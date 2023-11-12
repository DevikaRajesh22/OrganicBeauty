const Wishlist = require('../models/user/wishlistCollection');
const Cart = require('../models/user/cartCollection');
const User = require('../models/user/userCollection');
const Offer = require('../models/admin/offerCollection');
const Category = require('../models/admin/categoryCollection');
const Product = require('../models/admin/productCollection');

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
        const offerData = await Offer.find();
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
        const { offerName, discountAmount, activationDate, expiryDate, category } = req.body;
        let currentDate = new Date();
        currentDate = currentDate.toISOString().split('T')[0];
        const categoryFound = await Offer.findOne({ category: category });
        const categoryData = Category.findOne({ categoryName: category });
        let categoryId = (await categoryData)._id;
        if (activationDate < currentDate || expiryDate <= currentDate) {
            res.json({ dateValidation: true });
        } else if (categoryFound) {
            res.json({ duplicate: true });
        } else if (discountAmount <= 0) {
            res.json({ priceValidation: true });
        } else {
            const newCategoryOffer = new Offer({
                offerName: offerName,
                discountAmount: discountAmount,
                activationDate: activationDate,
                expiryDate: expiryDate,
            });
            const offer = newCategoryOffer.save();
            let offerId = (await offer)._id;
            //adding category name to offer
            await Offer.findOneAndUpdate({ _id: offerId }, {
                $set: {
                    category: category
                }
            });
            //setting offer to category
            let addOffer = await Category.findOneAndUpdate({ categoryName: category }, {
                $set: {
                    offer: offerId
                }
            });

            const updatedProductData = await Product.updateMany(
                { category: categoryId },
                { $set: { discountAmount: discountAmount } }
            );

            return res.json({ success: true });
        }
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin editCategoryOffer() GET request
exports.editCategoryOffer = async (req, res) => {
    try {
        const pageName = "Edit offer";
        const id = req.query.id;
        const offerData = await Offer.findById({ _id: id });
        res.render('admin/editCategoryOffer', { pageName, offerData, admin: req.session.admin });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin editCategoryOfferPost() POST request
exports.editCategoryOfferPost = async (req, res) => {
    try {
        console.log('edit category offer post');
        const offerId = req.body.id;
        console.log(offerId);
        const updatedOfferData = {
            offerName: req.body.offerName,
            discountAmount: req.body.disAmount,
            activationDate: req.body.actDate,
            expiryDate: req.body.expDate,
        };
        await Offer.findByIdAndUpdate(offerId, updatedOfferData);
        res.redirect('/admin/categoryOffer');
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin hideCategoryOffer() get request
exports.hideCategoryOffer = async (req, res) => {
    try {
        const offerId = req.query.id;
        await Offer.updateOne({ _id: offerId }, { $set: { isBlocked: true } });
        res.redirect('/admin/categoryOffer');
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin showCategoryOffer() get request
exports.showCategoryOffer = async (req, res) => {
    try {
        const offerId = req.query.id;
        await Offer.updateOne({ _id: offerId }, { $set: { isBlocked: false } });
        res.redirect('/admin/categoryOffer');
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