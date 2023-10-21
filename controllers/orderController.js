const User = require('../models/user/userCollection');
const Order = require('../models/user/orderCollection');
const Cart = require('../models/user/cartCollection');
const Product = require('../models/admin/productCollection');
const Address = require('../models/user/addressCollection');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

//orders() GET request
exports.orders = async (req, res) => {
    try {
        const pageTitle = 'Orders';
        const userId = req.session.userId;
        console.log(userId);
        const users = await User.findOne({ _id: userId });
        console.log(users);
        if (userId === undefined) {
            return res.redirect('/login');
        }
        if (!users) {
            return res.redirect('/login');
        }
        const orders = await Order.find();
        res.render('user/orders', { user: req.session.name, pageTitle, orders });
    } catch (error) {
        console.log(error.message);
    }
};

//placeOrder() POST request
exports.placeOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findOne({ _id: userId });
        const userName = req.session.name;
        const cartData = await Cart.findOne({ userId: userId });
        const products = cartData.products;
        const totalAmount = cartData.finalPrice;
        const date = new Date();

        const selAdd = req.body.selectedAddress.trim();
        const ObjectId = mongoose.Types.ObjectId;
        const selAddObjectId = new ObjectId(selAdd);
        const address = await Address.findOne({ user: userId }, { 'address': { $elemMatch: { '_id': selAdd } } });

        const deliveryDate = new Date(date);
        deliveryDate.setDate(date.getDate() + 10);
        const paymentMethod = req.body.payment;
        //orderId
        function generateOrderId() {
            const prefix = "ORD";
            const timestamp = Date.now(); // Get the current timestamp in milliseconds
            const uniqueId = prefix + timestamp;
            return uniqueId;
        }
        const orderId = generateOrderId();
        const newOrder = new Order({
            deliveryDetails: address,
            user: userId,
            userName: userName,
            products: products,
            deliveryDate: deliveryDate,
            totalAmount: totalAmount,
            date: date,
            paymentMethod: paymentMethod,
            orderId: orderId,
        });
        const orderDetails = await newOrder.save();

        //to remove products from cart when order is placed
        if(orderDetails){
            const removeProducts=await Cart.findOneAndUpdate({userId:userId},
               {$pull:{
                products:{}
               }})
        }

        //to reduce stock when order is placed
        const stockReduce = cartData.products;
        console.log('stockreduce'+stockReduce);
        for(let i=0;i<stockReduce.length;i++){
            const productId = stockReduce[i].productId;
            const updatedProduct = await Product.findByIdAndUpdate(
                productId, 
                {
                    $inc: { stock: -stockReduce[i].count } 
                },
                { new: true }
            );
            console.log(updatedProduct);
        }




        res.redirect('/success');
    } catch (error) {
        console.log(error.message);
    }
};

//userDet() GET request
exports.orderDet = async (req, res) => {
    try {
        const pageTitle = 'Orders';
        const orderId = req.query.orderId;
        const orders = await Order.findOne({ _id: orderId }).populate(
            "products.productId"
        );
        const userId = orders.user;
        const cart = await Cart.findOne({ userId: userId });
        const subTotal = cart.subTotal;
        res.render('user/orderDet', { user: req.session.name, pageTitle, orders, subTotal });
    } catch (error) {
        console.log(error.message);
    }
};

//cancelOrder() GET request
exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const deletedOrder = await Order.deleteOne({ _id: orderId });
        res.redirect('/orders');
    } catch (error) {
        console.log(error.message);
    }
};

//returnOrder() GET request
exports.returnOrder = async (req, res) => {
    try {
        console.log('return order get request received');
        const orderId = req.query.orderId;
        console.log(orderId);
    } catch (error) {
        console.log(error.message);
    }
}