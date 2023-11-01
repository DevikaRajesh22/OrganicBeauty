const User = require('../models/user/userCollection');
const Order = require('../models/user/orderCollection');
const Cart = require('../models/user/cartCollection');
const Product = require('../models/admin/productCollection');
const Address = require('../models/user/addressCollection');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const ObjectId = mongoose.Types.ObjectId;

//for razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZ_KEY,
    key_secret: process.env.RAZ_SECRET,
  });

//orders() GET request
exports.orders = async (req, res) => {
    try {
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
        const carts=await Cart?.findOne({userId:userId});
        let count=0;
        if(carts?.products?.length>0){
            count=count+carts.products.length;
        }else{
            count=0;
        }
        res.render('user/orders', { user: req.session.name, pageTitle, orders, products: products ,count})
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
        console.log('1',paymentMethod);
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


        //razorpay
        if(paymentMethod==='Cash on delivery'){
            console.log(paymentMethod);

            const updatePayment=await Order.updateOne(
                {user:userId},
                {$set:{status:"Placed"}}
            );
            console.log(updatePayment);
        
        //to remove products from cart when order is placed
        if (orderDetails) {
            const removeProducts = await Cart.findOneAndUpdate({ userId: userId },
                {
                    $pull: {
                        products: {}
                    }
                })
        }
     

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
        res.json({codSuccess:true});
        }else if(paymentMethod==='Online payment'){
            console.log(paymentMethod);
            const orderData={
                amount:totalAmount*100,
                currency:'INR',
                receipt:orderId,
            };
            razorpay.orders.create(orderData, (err, order) => {
                if(err){
                    console.log(err);
                }else{
                    console.log("razorpay order",order);
                    res.json({order});
                }
              });
        }else {
            console.log('error');
        }
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
        let count=0;
        if(cart?.products?.length>0){
            count=count+cart.products.length;
        }else{
            count=0;
        }
        res.render('user/orderDet', { user: req.session.name, pageTitle, orders, subTotal,count });
    } catch (error) {
        console.log(error.message);
    }
};

//cancelOrder() GET request
exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        console.log(orderId);
        const updatePayment=await Order.updateOne(
            {_id:orderId},
            {$set:{status:"Cancelled"}}
        );
        res.json({success:true});
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