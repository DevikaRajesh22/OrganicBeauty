const Wishlist = require('../models/user/wishlistCollection');
const Cart = require('../models/user/cartCollection');
const User = require('../models/user/userCollection');

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
        const userData=await User.findOne({_id:req.session.userId});
        const referral=userData.referralCode;
        res.render('user/referral', { pageTitle, user: req.session.name, pageTitle, count, wishlistCount, referral })
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};