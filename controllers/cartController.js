const Cart = require('../models/user/cartCollection');
const Product = require('../models/admin/productCollection');
const User = require('../models/user/userCollection');
const Coupon = require('../models/admin/couponCollection');
const Address = require('../models/user/addressCollection');
const Order = require('../models/user/orderCollection');
const Razorpay = require('razorpay');
const crypto = require('crypto');

//cartGet() GET request
exports.cartGet = async (req, res) => {
    try {
        let couponSelected;
        let couponApplied;
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
            const subTotal = carts.products.reduce((acc, val) => acc + val.totalPrice, 0);
            let finalPrice = subTotal + 10;
            couponApplied = await Coupon.findOne({ couponCode: carts?.couponApplied });
            if (couponApplied) {
                finalPrice = finalPrice - couponApplied.maximumDiscount;
                couponSelected = await Coupon.findOne({ couponCode: carts?.couponApplied });
            }
            const filter = { userId: userId };
            const update = {
                $set: {
                    subTotal: subTotal,
                    finalPrice: finalPrice,
                }
            };
            const updatedCart = await Cart.updateOne(filter, update);
            console.log(updatedCart);
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
                res.render('user/cart', { pageTitle, carts, product: products, user: req.session.name, count, cartProduct, coupon,couponSelected,couponApplied});
            } else {
                res.render('user/cart', { pageTitle, carts, product: undefined, user: req.session.name, count});
            }
        } else {
            res.render('user/cart', { pageTitle, carts: undefined, product: undefined, total: 0, user: req.session.name, count })
        }
    } catch (error) {
        console.log(error);
    }
};

//addToCart() POST request
exports.addToCartPost = async (req, res) => {
    try {
        const user = req.session.userId; // Find the user
        if (!user) {
            return res.redirect('/login');
        }
        const productId = req.query.id; // Get the ID from the query parameter
        const product = await Product.findById(productId); // Find the product by its ID
        let cartFound = await Cart.findOne({ userId: user }); // Check if there is a cart for the user
        let userFound = await User.findOne({ _id: user });

        if (!cartFound) {
            // Create a new cart
            const newCart = new Cart({
                userId: user,
                finalPrice: product.price + 10,
                subTotal: product.price,
                products: [{
                    productId: productId,
                    count: 1,
                    productPrice: product.price,
                    totalPrice: product.price
                }]
            });
            await newCart.save();
        } else {
            // Check if the product is already in the cart
            const existingProductIndex = cartFound.products.findIndex(p => p.productId.toString() === productId);

            if (existingProductIndex === -1) {
                // If the product is not in the cart, add it as a new product
                cartFound.products.push({
                    productId: product._id,
                    count: 1,
                    productPrice: product.price,
                    totalPrice: product.price
                });
            } else {
                // If the product is already in the cart, increase the count and adjust the price
                cartFound.products[existingProductIndex].count += 1;
                cartFound.products[existingProductIndex].totalPrice = cartFound.products[existingProductIndex].count * product.price;
            }

            await cartFound.save();
        }


    } catch (error) {
        console.log(error.message);
    }
};

//updateCartQuantity() POST request
exports.updateCartQuantity = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findOne({ _id: userId });
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

        // console.log('existingProduct', existingProduct);

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
        res.status(200).json({ success: true, message: 'Cart item updated successfully' });
    } catch (error) {
        console.log(error.message);
    }
};

//removeProduct() GET request
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
    }
};

//checkout() GET request
exports.checkout = async (req, res) => {
    try {
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
        const addresses = await Address.findOne({ user: userId });
        const address = addresses.address;
        const products = carts.products;
        res.render('user/checkout', { pageTitle, user: req.session.name, carts, addresses, address, count, products });
    } catch (error) {
        console.log(error.message);
    }
};

//editAddress() GET request
exports.editAddress = async (req, res) => {
    try {
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
        res.render('user/editAddress', { user: req.session.name, address, pageTitle, count });
    } catch (error) {
        console.log(error.message);
    }
};

//editAddressPost() POST request
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
    }
};

//success() GET request
exports.success = async (req, res) => {
    try {
        const pageTitle = 'Success';
        const userId = req.session.userId;
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        res.render('user/success', { pageTitle, user: req.session.name, count });
    } catch (error) {
        console.log(error.message);
    }
};

//verifyPayment() POST request
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
            const removeCart = await Cart.findOneAndUpdate({ userId: userId },
                {
                    $pull: {
                        products: {}
                    }
                })
            await Order.updateOne(
                { orderId: details.order.receipt },
                { $set: { status: "Placed" } }
            );

            res.json({ payment: true })
        }
    } catch (error) {
        console.log(error.message);
    }
};