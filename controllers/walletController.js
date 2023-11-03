const Cart=require('../models/user/cartCollection');

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