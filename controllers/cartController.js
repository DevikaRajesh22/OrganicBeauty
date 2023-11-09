const Cart = require('../models/user/cartCollection');
const Product = require('../models/admin/productCollection');
const User = require('../models/user/userCollection');
const Coupon = require('../models/admin/couponCollection');
const Address = require('../models/user/addressCollection');
const Order = require('../models/user/orderCollection');
const Wishlist = require('../models/user/wishlistCollection');
const Razorpay = require('razorpay');
const crypto = require('crypto');

//user cartGet() GET request
exports.cartGet = async (req, res) => {
    try {
        let wishlistCount = 0;
        const wishlist = await Wishlist.findOne({ user: req.session.userId });
        wishlist ? wishlistCount = wishlist.products.length : 0;
        let couponSelected;
        let couponApplied;
        let finalPrice;
        let subTotal;
        const userId = req.session.userId;
        const coupon = await Coupon.find({
            $and: [
                { usedUsers: { $nin: [userId] } },
                { showStatus: true }
            ]
        });
        const users = await User.findOne({ _id: userId });
        if (!users) {
            res.redirect('/login');
        }
        const pageTitle = 'Cart';
        const carts = await Cart.findOne({ userId: userId }).populate('products.productId');
        if (carts) {
            subTotal = carts.products.reduce((acc, val) => acc + val.totalPrice, 0);
            finalPrice = carts.products.reduce((acc, val) => acc + val.totalPrice, 0) + 10;
            couponApplied = await Coupon.findOne({ couponCode: carts?.couponApplied });
            if (couponApplied !== null) {
                finalPrice = finalPrice - couponApplied.maximumDiscount;
                couponSelected = await Coupon.findOne({ couponCode: carts?.couponApplied });
            }
        }
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        if (carts) {
            const products = carts.products.length;
            if (products > 0) { // Check if there are products in the cart
                let cartProduct = carts.products;
                res.render('user/cart', { pageTitle, carts, product: products, user: req.session.name, count, cartProduct, coupon, subTotal, total: finalPrice, couponSelected, couponApplied, wishlistCount });
            } else {
                res.render('user/cart', { pageTitle, carts, product: undefined, total: 0, user: req.session.name, count, wishlistCount });
            }
        } else {
            res.render('user/cart', { pageTitle, carts: undefined, product: undefined, total: 0, user: req.session.name, count, wishlistCount })
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user addToCart() POST request
exports.addToCartPost = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.body.product;
        const user = await User.findOne({ _id: userId });
        const product = await Product.findOne({ _id: productId }).populate('category');
        const cart = await Cart.findOne({ userId: userId });
        const price = product.price;
        if (userId === undefined) {
            return res.json({ login: true });
        } else {
            if (!cart && product.stock > 0) {
                const cart = new Cart({
                    userId: userId,
                    userName: user.username,
                    products: [{
                        productId: productId,
                        count: 1,
                        productPrice: price,
                        totalPrice: 1 * price
                    }]

                })
                const cartAdded = await cart.save();
            } else {
                const existingProduct = await cart.products.find(
                    (product) => product.productId.toString() === productId.toString()
                );
                if (existingProduct) {
                    res.json({ exist: true })
                } else if (product.stock > 0) {
                    const newProduct = {
                        productId: productId,
                        count: 1,
                        productPrice: price,
                        totalPrice: 1 * price
                    }
                    const updatedCart = await Cart.findOneAndUpdate(
                        { userId: userId },
                        { $push: { products: newProduct } },
                        { new: true }
                    );
                    return res.json({ success: true })
                } else {
                    return res.json({ outOfStock: true })
                }
            }
        }
        return res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        // res.render('user/error');
    }
};

//user updateCartQuantity() POST request
exports.updateCartQuantity = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.body.productId;
        let count = req.body.count;
        count = parseInt(count);
        const cartData = await Cart.findOne({ userId: userId });
        const productData = await Product.findOne({ _id: productId });
        if (!cartData || !productData) {
            res.json({ success: false, message: "Cart or product not found." });
            return;
        }
        const productQuantity = productData.stock;
        const existingProductIndex = cartData.products.findIndex(
            (product) => product.productId.toString() === productId.toString()
        );
        if (existingProductIndex === -1) {
            res.json({ success: false, message: "Product not found in the cart." });
            return;
        }
        const existingProduct = cartData.products[existingProductIndex];
        const updatedQuantity = existingProduct.count + count;
        if (updatedQuantity <= 0 || updatedQuantity > productQuantity) {
            res.json({ success: false, message: "Invalid quantity." });
            return;
        }
        // Update the product count and total price in the cart
        cartData.products[existingProductIndex].count = updatedQuantity;
        // Calculate the updated total price for the product
        const productPrice = productData.price;
        const productTotal = productPrice * updatedQuantity;
        cartData.products[existingProductIndex].totalPrice = productTotal;
        await cartData.save();
        res.json({ success: true, message: 'Cart item updated successfully' });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user removeProduct() GET request
exports.removeProduct = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.body.productId;
        const cart = await Cart.findOne({ userId: userId });
        if (cart) {
            await Cart.findOneAndUpdate(
                { userId: userId },
                {
                    $pull: {
                        products: {
                            productId: productId,
                        },
                    },
                }
            );
            res.json({ success: true });
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user checkout() GET request
exports.checkout = async (req, res) => {
    try {
        let wishlistCount = 0;
        const wishlist = await Wishlist.findOne({ user: req.session.userId });
        wishlist ? wishlistCount = wishlist.products.length : 0;
        const pageTitle = 'Checkout';
        const userId = req.session.userId;
        const carts = await Cart.findOne({ userId: userId })
            .populate({
                path: 'products.productId',
                model: 'Product',
                select: 'productId productName productImage'
            });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        let subTotal = carts.products.reduce((acc, val) => acc + val.totalPrice, 0);
        let finalPrice = carts.products.reduce((acc, val) => acc + val.totalPrice, 0) + 10;
        let couponApplied = await Coupon.findOne({ couponCode: carts?.couponApplied });
        if (couponApplied) {
            finalPrice = finalPrice - couponApplied.maximumDiscount;
        }

        const addresses = await Address.findOne({ user: userId });
        const address = addresses.address;
        const products = carts.products;
        res.render('user/checkout', { pageTitle, user: req.session.name, carts, subTotal, finalPrice, couponApplied, addresses, address, count, products, wishlistCount });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user editAddress() GET request
exports.editAddress = async (req, res) => {
    try {
        let wishlistCount = 0;
        const wishlist = await Wishlist.findOne({ user: req.session.userId });
        wishlist ? wishlistCount = wishlist.products.length : 0;
        const pageTitle = 'Address';
        const userId = req.session.userId;
        const addressId = req.query.id;
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
        res.render('user/editAddress', { user: req.session.name, address, pageTitle, count, wishlistCount });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user editAddressPost() POST request
exports.editAddressPost = async (req, res) => {
    try {
        const userId = req.session.userId;
        const addressId = req.body.id;
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
        res.redirect('/checkout');
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user success() GET request
exports.success = async (req, res) => {
    try {
        let wishlistCount = 0;
        const wishlist = await Wishlist.findOne({ user: req.session.userId });
        wishlist ? wishlistCount = wishlist.products.length : 0;
        const pageTitle = 'Success';
        const userId = req.session.userId;
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        res.render('user/success', { pageTitle, user: req.session.name, count, wishlistCount });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user verifyPayment() POST request
exports.verifyPayment = async (req, res) => {
    try {
        const details = req.body;
        const userId = req.session.userId
        const cart = await Cart.findOne({ userId });
        const hmac = crypto.createHmac("sha256", process.env.RAZ_SECRET);
        hmac.update(
            details.payment.razorpay_order_id +
            "|" +
            details.payment.razorpay_payment_id
        );
        const hmacValue = hmac.digest("hex");
        if (hmacValue === details.payment.razorpay_signature) {
            const stockReduce = cart.products
            for (let i = 0; i < stockReduce.length; i++) {
                const productId = stockReduce[i].productId;
                const updatedProduct = await Product.findByIdAndUpdate(
                    productId,
                    {
                        $inc: { stock: -stockReduce[i].count }
                    },
                    { new: true }
                );
            }
            //to remove products from cart when order is placed and to remove coupon
            await Cart.findOneAndUpdate({ userId: userId }, { $set: { products: [], couponApplied: '' } });
            await Order.updateOne(
                { orderId: details.order.receipt },
                { $set: { status: "Placed" } }
            );

            res.json({ payment: true })
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};