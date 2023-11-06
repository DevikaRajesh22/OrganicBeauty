const Cart = require('../models/user/cartCollection');
const Wishlist = require('../models/user/wishlistCollection');

//user wishlist() GET request
exports.wishlist = async (req, res) => {
    try {
        const pageTitle = 'Wishlist';
        const userId = req.session.userId;
        const carts = await Cart.findOne({ userId: userId });
        let count = 0;
        let wishlistCount = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        const wishlist = await Wishlist.findOne({ user: userId }).populate(
            "products.productId"
        );
        wishlist ? wishlistCount = wishlist.products.length : 0;
        res.render('user/wishlist', { user: req.session.name, pageTitle, count, wishlist, wishlistCount });
    } catch (error) {
        console.log(error.message);
    }
};

//user addToWishlist() POST request
exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.body.productId;
        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            const newWishList = new Wishlist({
                user: userId,
                products: [
                    {
                        productId: productId,
                    },
                ],
            });
            await newWishList.save();
        } else {
            const existingProduct = await wishlist.products.find(
                (product) => product.productId.toString() === productId.toString()
            );
            if (existingProduct) {
                const removedProduct = await Wishlist.findOneAndUpdate(
                    { user: userId },
                    {
                        $pull: { products: { productId: productId } },
                    },
                    { new: true }
                );
                if (removedProduct) {
                    res.json({ removed: true });
                }
            } else {
                const addToWishList = await Wishlist.findOneAndUpdate(
                    { user: userId },
                    {
                        $push: { products: { productId: productId } },
                    },
                    { new: true }
                );
                if (addToWishList) {
                    res.json({ added: true });
                }
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};

//user removeFromWishlist() POST request
exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.body.productId;
        const remove = await Wishlist.findOneAndUpdate({ user: userId },
            {
                $pull: {
                    products: {
                        productId: productId
                    }
                }
            });
        if (remove) {
            res.json({ remove: true });
        }
    } catch (error) {
        console.log(error.message);
    }
};