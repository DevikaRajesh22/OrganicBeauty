const User = require('../models/user/userCollection');
const Order = require('../models/user/orderCollection');
const Cart = require('../models/user/cartCollection');
const Product = require('../models/admin/productCollection');
const Address = require('../models/user/addressCollection');
const Wishlist = require('../models/user/wishlistCollection');
const Coupon = require('../models/admin/couponCollection');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const { log } = require('console');
const ObjectId = mongoose.Types.ObjectId;

//admin orderGet() GET request
exports.orderGet = async (req, res) => {
    try {
        const pageName = "Order";
        let pageNum=req.query.pageNum;
        let perPage=10;
        let orderCount=await Order.find().countDocuments();
        let page=Math.ceil(orderCount/perPage);
        const orders = await Order.find().skip((pageNum - 1)*perPage).limit(perPage).sort({date:-1});
        res.render("admin/orders", { pageName, orders, page });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin updateStatus() POST request
exports.updateStatus = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const order = await Order.findOne({ _id: orderId });
        const status = order.status;
        if (status === "Shipped") {
            const updatedStatus = await Order.findOneAndUpdate(
                { _id: orderId },
                { $set: { status: "Out for delivery" } }
            );
        } else if (status === "Out for delivery") {
            const updatedStatus = await Order.findOneAndUpdate(
                { _id: orderId },
                { $set: { status: "Delivered" } }
            );
        } else if (status === "Placed") {
            const updatedStatus = await Order.findOneAndUpdate(
                { _id: orderId },
                { $set: { status: "Shipped" } }
            );
        } else if (status === "Pending") {
            const updatedStatus = await Order.findOneAndUpdate(
                { _id: orderId },
                { $set: { status: "Placed" } }
            );
        }
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin orderDetails() GET request
exports.orderDetails = async (req, res) => {
    try {
        console.log('order details');
        const orderId = req.query.orderId;
        const pageName = "Order";
        const orders = await Order.findOne({ _id: orderId }).populate(
            "products.productId"
        );
        const userId = orders.user;
        const cart = await Cart.findOne({ userId: userId });
        let subTotal = orders.totalAmount-10 ; //add discount amount too
        let finalPrice = orders.totalAmount;
        const address=orders.deliveryDetails;
        console.log(address);
        res.render("admin/orderDetails", { pageName, orders, subTotal, finalPrice, address });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//for razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZ_KEY,
    key_secret: process.env.RAZ_SECRET,
});

//user orders() GET request
exports.orders = async (req, res) => {
    try {
        let wishlistCount = 0;
        const wishlist = await Wishlist.findOne({ user: req.session.userId });
        wishlist ? wishlistCount = wishlist.products.length : 0;
        const pageTitle = 'Orders';
        const userId = req.session.userId;
        const users = await User.findOne({ _id: userId });
        if (userId === undefined) {
            return res.redirect('/login');
        }
        if (!users) {
            return res.redirect('/login');
        }
        let pageNum=req.query.id;
        let perPage=10;
        let productCount=await Order.find({user:userId}).countDocuments();
        let page=Math.ceil(productCount/perPage);
        const orders = await Order.find({ user: userId }).skip((pageNum - 1)*perPage).limit(perPage).sort({date:-1});
        const products = orders.products;
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        res.render('user/orders', { user: req.session.name, pageTitle, orders, products: products, count, wishlistCount, page })
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user placeOrder() POST request
exports.placeOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const addressId = req.body.selectedAddress.trim();
        const cartData = await Cart.findOne({ userId: userId });
        const cart = await Cart.findOne({ userId: userId }).populate('products.productId');
        const products = cartData.products;
        const productStock = cart.products;
        const total = parseInt(req.body.Total);
        const paymentMethods = req.body.payment;
        const userData = await User.findOne({ _id: userId });
        const name = userData.name;
        const date = new Date();
        const selectedAddress = await Address.findOne(
            { user: userId, 'address._id': addressId },
            { 'address.$': 1 }
        );
        const address = selectedAddress.address[0];
        const deliveryDate = new Date(date);
        deliveryDate.setDate(date.getDate() + 10);
        function generateOrderId() {
            const prefix = "ORD";
            const timestamp = Date.now();
            const uniqueId = prefix + timestamp;
            return uniqueId;
        }
        const orderId = generateOrderId();
        const newOrder = new Order({
            deliveryDetails: address,
            user: userId,
            userName: name,
            products: products,
            deliveryDate: deliveryDate,
            totalAmount: total,
            date: date,
            paymentMethod: paymentMethods,
            orderId: orderId,
        });
        const orderDetails = await newOrder.save();
        const oId = orderDetails._id;
        const couponFound = await Coupon.findOne({ couponName: cartData?.couponApplied });
        if (couponFound) {
            await Coupon.findOneAndUpdate({ couponName: cartData.couponApplied }, { $addToSet: { usedUsers: userId } });
        }
        //payment methods
        if (paymentMethods === 'Cash on delivery') {
            console.log('cash');
            const updatePayment = await Order.updateOne(
                { user: userId },
                { $set: { status: "Placed" } }
            );
            //to remove products from cart when order is placed and to remove coupon
            await Cart.findOneAndUpdate({ userId }, { $set: { products: [], couponApplied: '' } });
            //to reduce stock when order is placed
            const stockReduce = cartData.products;
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
            res.json({ cash: true });
        } else if (paymentMethods === "Wallet") {
            if (userData.wallet > orderDetails.totalAmount) {
                let result = await User.updateOne({ _id: req.session.userId }, {
                    $inc: {
                        wallet: -orderDetails.totalAmount
                    },
                    $push: {
                        walletHistory: {
                            amount: orderDetails.totalAmount,
                            status: "Debit",
                            date: new Date()
                        }
                    }
                });
                //to reduce stock
                const stockReduce = cartData.products
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
                //to pull cart and coupon
                await Cart.findOneAndUpdate({ userId }, { $set: { products: [], couponApplied: '' } });
                await Order.findByIdAndUpdate(
                    { _id: oId },
                    { $set: { status: "Placed" } }
                );
                res.json({ wallet: true })
            } else {
                res.json({ balance: true })
            }
        } else if (paymentMethods === "Online payment") {
            let Total = await Order.findOne({ _id: oId })
            const orderData = {
                amount: Total.totalAmount * 100,
                currency: 'INR',
                receipt: orderId,
            };
            razorpay.orders.create(orderData, (err, order) => {
                if (err) {
                    console.log(err);
                } else {
                    res.json({ order });
                }
            });
        } else {
            console.log('error');
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user userDet() GET request
exports.orderDet = async (req, res) => {
    try {
        let wishlistCount = 0;
        const wishlist = await Wishlist.findOne({ user: req.session.userId });
        wishlist ? wishlistCount = wishlist.products.length : 0;
        const pageTitle = 'Orders';
        const orderId = req.query.orderId;
        const orders = await Order.findOne({ _id: orderId }).populate(
            "products.productId"
        );
        const address = orders.deliveryDetails;
        const userId = orders.user;
        const cart = await Cart.findOne({ userId: userId });
        let count = 0;
        if (cart?.products?.length > 0) {
            count = count + cart.products.length;
        } else {
            count = 0;
        }
        let finalPrice = orders.totalAmount;
        console.log(finalPrice);
        let subTotal=orders.totalAmount-10;
        console.log(subTotal);
        let couponApplied = await Coupon.findOne({ couponCode: cart?.coupon });
        console.log(couponApplied);
        if (couponApplied) {
            console.log(couponApplied.maximumDiscount);
            subTotal += couponApplied.maximumDiscount;
        }
        res.render('user/orderDet', { user: req.session.name, pageTitle, orders, subTotal, address, finalPrice, couponApplied, count, wishlistCount });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user cancelOrder() GET request
exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        const user = req.session.userId;
        let totalAmount = await Order.findOne({ _id: orderId });
        const updatePayment = await Order.updateOne(
            { _id: orderId },
            { $set: { status: "Cancelled" } }
        );
        const cartData = await Cart.findOne({ userId: user });
        const couponFound = await Coupon.findOne({ couponName: cartData?.couponApplied });
        if (couponFound) {
            await Coupon.findOneAndUpdate({ couponName: cartData.couponApplied }, { $addToSet: { usedUsers: userId } });
        }
        let walletBal = await User.findOne({ _id: user }, { wallet: 1 });
        const wallet = await User.updateOne(
            { _id: user },
            {
                $set: { wallet: walletBal.wallet + totalAmount.totalAmount },
                $push: {
                    walletHistory: {
                        date: new Date(),
                        amount: totalAmount.totalAmount,
                        status: "Credit"
                    }
                }
            }
        );
        if (updatePayment) {
            res.json({ success: true });
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user returnOrder() GET request
exports.returnOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        const user = req.session.userId;
        let totalAmount = await Order.findOne({ _id: orderId });
        const updatePayment = await Order.updateOne(
            { _id: orderId },
            { $set: { status: "Returned" } }
        );
        const cartData = await Cart.findOne({ userId: user });
        const couponFound = await Coupon.findOne({ couponName: cartData?.couponApplied });
        if (couponFound) {
            await Coupon.findOneAndUpdate({ couponName: cartData.couponApplied }, { $addToSet: { usedUsers: userId } });
        }
        let walletBal = await User.findOne({ _id: user }, { wallet: 1 });
        const wallet = await User.updateOne(
            { _id: user },
            {
                $set: { wallet: walletBal.wallet + totalAmount.totalAmount },
                $push: {
                    walletHistory: {
                        date: new Date(),
                        amount: totalAmount.totalAmount,
                        status: "Credit"
                    }
                }
            }
        );
        if (updatePayment) {
            res.json({ success: true });
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};