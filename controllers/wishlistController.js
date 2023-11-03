const Cart=require('../models/user/cartCollection');

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