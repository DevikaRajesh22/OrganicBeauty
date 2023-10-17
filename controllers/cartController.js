const Cart = require('../models/user/cartCollection');
const Product = require('../models/admin/productCollection');
const User = require('../models/user/userCollection');
const Category = require('../models/admin/categoryCollection');
const Address = require('../models/user/addressCollection');

//cartGet() GET request
exports.cartGet = async (req, res) => {
    try {

        const userId = req.session.userId;
        const users = await User.findOne({ _id: userId });
        if (!users) {
            res.redirect('/login');
        }
        const user = req.session.name;
        const pageTitle = 'Cart';
        const carts = await Cart.findOne({ userId: userId })
            .populate({
                path: 'products.productId',
                model: 'Product',
                select: 'productId productName productImage'
            });

        if (carts) {
            const products = carts.products.length;
            if (products > 0) { // Check if there are products in the cart
                try {
                    const total = await Cart.aggregate([
                        { $match: { userId: userId } },
                        { $unwind: "$products" },
                        {
                            $group: {
                                _id: null,
                                total: {
                                    $sum: {
                                        $multiply: ["$products.productPrice", "$products.count"],
                                    },
                                },
                            },
                        },
                    ]);
                    const totalValue = total[0].total;
                    const finalPriceValue = carts.shipping + totalValue;
                    await Cart.updateOne(
                        { userId: userId },
                        {
                            $set: {
                                finalPrice: finalPriceValue,
                                subTotal: totalValue
                            }
                        }
                    );
                    const updatedResult = await Cart.findOne({ userId: userId });
                    if (updatedResult) {
                        await updatedResult.save();
                        res.render('user/cart', { pageTitle, carts, product: products, total: total[0].total, user: req.session.name });
                    } else {
                        // Handle the case where total is empty or undefined
                        res.render('user/cart', { pageTitle, carts: undefined, product: products, total: 0, user });
                    }
                } catch (err) {
                    console.error('Error in aggregation:', err);
                    // Handle the error, send an error response or redirect as needed
                }
            }
        } else {
            res.render('user/cart', { pageTitle, carts: undefined, total: 0, user: req.session.name })
        }



    } catch (error) {
        console.log(error);
    }
};

exports.addToCartPost = async (req, res) => {
    try {
        const user = req.session.userId; //to find user
        if (!user) {
            return res.redirect('/login');
        }
        const productId = req.query.id; //get the id by the query in a tag
        const product = await Product.findById(productId); //finding the product by the product
        let cartFound = await Cart.findOne({ userId: user }); //to check if there is a cart for the user
        if (!cartFound) {
            //create a new cart
            const newCart = new Cart({
                userId: user,
                finalPrice: product.price + 10,
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
            const existingProductIndex = userFound.products.findIndex(p => p.productId.toString() === productId);

            if (existingProductIndex === -1) {
                // If the product is not in the cart, add it as a new product
                userFound.products.push({
                    productId: product._id,
                    count: 1,
                    productPrice: product.price,
                    totalPrice: product.price
                });
            } else {
                // If the product is already in the cart, increase the count and adjust the price
                userFound.products[existingProductIndex].count += 1;
                userFound.products[existingProductIndex].totalPrice = userFound.products[existingProductIndex].count * product.price;
            }

            await userFound.save();
        }

        res.redirect('/products');
    } catch (error) {
        console.log(error.message);
    }
};

//updateCartQuantity() POST request
exports.updateCartQuantity = async (req, res) => {
    try {
        // console.log('req received');
        const userId = req.session.userId;
        // console.log(userId);
        const user = await User.findOne({ _id: userId });
        const productId = req.body.productId;
        let count = req.body.count;
        count = parseInt(count);

        const cartData = await Cart.findOne({ userId: userId });

        const productData = await Product.findOne({ _id: productId });
        // console.log(cartData);


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
        if (updatedQuantity <= 0 || updatedQuantity > productQuantity) {
            return;
        }
        // Update the product count and total price in the cart
        cartData.products[existingProductIndex].count = updatedQuantity;
        // console.log(cartData.products[existingProductIndex].count);

        // Calculate the updated total price for the product
        const productPrice = productData.price;
        const productTotal = productPrice * updatedQuantity;
        cartData.products[existingProductIndex].totalPrice = productTotal;
        cartData.finalPrice = cartData.shipping + productTotal;

        // Save the updated cart
        await cartData.save();


        res.status(200).json({ success: true, message: 'Cart item updated successfully' });
    } catch (error) {
        console.log(error.message);
    }
};

//removeProduct() GET request
exports.removeProduct = async (req, res) => {
    try {
        // console.log('removeProduct() get request');
        const userId = req.session.userId;
        const productId = req.body.productId;
        // console.log('userid', userId);
        // console.log('productId', productId);
        const cart = await Cart.findOne({ userId: userId });
        // console.log('cart',cart);
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
        const addresses = await Address.findOne({ user: userId });
        res.render('user/checkout', { pageTitle, user: req.session.name, carts, addresses });
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
        res.render('user/editAddress', { user: req.session.name, address, pageTitle });
    } catch (error) {
        console.log(error.message);
    }
};

//editAddressPost() POST request
exports.editAddressPost = async (req, res) => {
    try {
        // console.log('editAddressPost');
        const userId = req.session.userId;
        // console.log(userId);
        const addressId=req.body.id;
        // console.log(addressId);
        const {country,state,apartment,city,street,zipcode,type}=req.body;
        const updatedAddress=await Address.updateOne(
            {user:userId,'address._id':addressId},
            {
                $set:{
                    "address.$.country":country,
                    "address.$.state":state,
                    "address.$.apartment":apartment,
                    "address.$.city":city,
                    "address.$.street":street,
                    "address.$.zipcode":zipcode,
                    "address.$.type":type,

                },
            },
        );
        // console.log(updatedAddress);
        res.redirect('/checkout');
    } catch (error) {
        console.log(error.message);
    }
};

//success() GET request
exports.success = async (req, res) => {
    try {
        const pageTitle = 'Success';
        res.render('user/success', { pageTitle, user: req.session.name });
    } catch (error) {
        console.log(error.message);
    }
}


