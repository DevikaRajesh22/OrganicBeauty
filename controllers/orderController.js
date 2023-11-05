const User = require('../models/user/userCollection');
const Order = require('../models/user/orderCollection');
const Cart = require('../models/user/cartCollection');
const Product = require('../models/admin/productCollection');
const Address = require('../models/user/addressCollection');
const Wishlist = require('../models/user/wishlistCollection');
const Coupon=require('../models/admin/couponCollection');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const ObjectId = mongoose.Types.ObjectId;

//admin orderGet() GET request
exports.orderGet = async (req, res) => {
    try {
        const pageName = "Order";
        const orders = await Order.find();
        res.render("admin/orders", { pageName, orders });
    } catch (error) {
        console.log(error.message);
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
            res.json({ success: true })
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
            res.json({ success: true })
        } else if (status === "Pending") {
            const updatedStatus = await Order.findOneAndUpdate(
                { _id: orderId },
                { $set: { status: "Placed" } }
            );
            res.json({ success: true });
        }
    } catch (error) {
        console.log(error.message);
    }
};

//admin orderDetails() GET request
exports.orderDetails = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const pageName = "Order";
        const orders = await Order.findOne({ _id: orderId }).populate(
            "products.productId"
        );
        const userId = orders.user;
        const cart = await Cart.findOne({ userId: userId });
        const subTotal = cart.subTotal;
        res.render("admin/orderDetails", { pageName, orders, subTotal });
    } catch (error) {
        console.log(error.message);
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
        const orders = await Order.find({ user: userId });
        const products = orders.products;
        const carts = await Cart?.findOne({ userId: userId });
        let count = 0;
        if (carts?.products?.length > 0) {
            count = count + carts.products.length;
        } else {
            count = 0;
        }
        res.render('user/orders', { user: req.session.name, pageTitle, orders, products: products, count, wishlistCount })
    } catch (error) {
        console.log(error.message);
    }
};

//user placeOrder() POST request
exports.placeOrder = async (req, res) => {
    try {
        console.log('place order');
        const userId = req.session.userId;
        console.log(userId);
        const addressId = req.body.selectedAddress.trim();
        console.log(addressId);
        const cartData = await Cart.findOne({ userId: userId });
        const cart = await Cart.findOne({ userId: userId }).populate('products.productId');
        const products = cartData.products;
        const productStock = cart.products;
        console.log(productStock);
        const total = parseInt(req.body.Total);
        console.log(total);
        const paymentMethods = req.body.payment;
        console.log(paymentMethods);
        const userData = await User.findOne({ _id: userId });
        const name = userData.name;
        console.log(name);
       
        const date = new Date();
        const selectedAddress = await Address.findOne(
            { user: userId, 'address._id': addressId },
            { 'address.$': 1 }
        );
        console.log(date);
        console.log(selectedAddress);
        const address = selectedAddress.address[0];
        console.log(address);
        const deliveryDate = new Date(date);
        deliveryDate.setDate(date.getDate() + 10);
        console.log(deliveryDate);
        function generateOrderId() {
            const prefix = "ORD";
            const timestamp = Date.now();
            const uniqueId = prefix + timestamp;
            return uniqueId;
        }
        const orderId = generateOrderId();
        console.log(orderId);
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
        console.log(oId);
        const couponFound = await Coupon.findOne({ couponName: cartData?.couponApplied });
        if (couponFound) {
            await Coupon.findOneAndUpdate({ couponName: cartData.couponApplied }, { $addToSet: { usedUsers: userId } });
        }
        //razorpay
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
            res.json({ wallet: true });
        } else if (paymentMethods === "Online payment") {
            console.log('online');
            let Total = await Order.findOne({_id : oId})
            console.log(Total);
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
        const userId = orders.user;
        const cart = await Cart.findOne({ userId: userId });
        const subTotal = cart.subTotal;
        let count = 0;
        if (cart?.products?.length > 0) {
            count = count + cart.products.length;
        } else {
            count = 0;
        }
        res.render('user/orderDet', { user: req.session.name, pageTitle, orders, subTotal, count, wishlistCount });
    } catch (error) {
        console.log(error.message);
    }
};

//user cancelOrder() GET request
exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        const updatePayment = await Order.updateOne(
            { _id: orderId },
            { $set: { status: "Cancelled" } }
        );
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
    }
};

//user returnOrder() GET request
exports.returnOrder = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        console.log(orderId);
    } catch (error) {
        console.log(error.message);
    }
};