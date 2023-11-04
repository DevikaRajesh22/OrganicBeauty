const Cart=require('../models/user/cartCollection');
const Wishlist=require('../models/user/wishlistCollection');

//wallet() GET request
exports.wallet = async (req, res) => {
    try {
        const pageTitle = 'Wallet';
        let wishlistCount=0;
        const wishlist=await Wishlist.findOne({user:req.session.userId});
        wishlist?wishlistCount=wishlist.products.length:0;
        const userId = req.session.userId;
        const carts = await Cart.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        res.render('user/wallet', { user: req.session.name, pageTitle, count, wishlistCount });
    } catch (error) {
        console.log(error.message);
    }
};