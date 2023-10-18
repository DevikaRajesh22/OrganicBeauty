const User = require('../models/user/userCollection');
const Order = require('../models/user/orderCollection');
const Cart = require('../models/user/cartCollection');

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
        res.render('user/orders', { user: req.session.name, pageTitle });
    } catch (error) {
        console.log(error.message);
    }
};

//placeOrder() POST request
exports.placeOrder = async (req, res) => {
    try {
        console.log('place order post request');

        const userId = req.session.userId;
        console.log('userId' + userId);

        //user
        const user = await User.findOne({ _id: userId });
        console.log('user' + user);

        //userName
        const userName = req.session.name;
        console.log('userName' + userName);

        const cartData = await Cart.findOne({ userId: userId });
        console.log('cartData' + cartData);

        const products = cartData.products;
        console.log('products' + products);

        const totalAmount = cartData.finalPrice;
        console.log('totalAmount' + totalAmount);

        //date
        const date = new Date();
        console.log('date' + date);

        //deliveryDate
        const deliveryDate = new Date(date);
        deliveryDate.setDate(date.getDate() + 10);
        const options = {
            weekday: 'short', // E.g., "Wed"
            month: 'short',   // E.g., "Oct"
            day: 'numeric',   // E.g., "18"
            year: 'numeric',  // E.g., "2023"
            hour: '2-digit',  // E.g., "10"
            minute: '2-digit', // E.g., "37"
            second: '2-digit', // E.g., "55"
            timeZoneName: 'long', // E.g., "India Standard Time"
            timeZone: 'UTC'  // Use 'UTC' to ensure consistent formatting
        };
        const formattedDeliveryDate = deliveryDate.toLocaleString('en-US', options);
        console.log('Formatted delivery date: ' + formattedDeliveryDate);

        //paymentMethod
        const paymentMethod = req.body.payment;
        console.log(paymentMethod);

        //orderId
        function generateOrderId() {
            const prefix = "ORD";
            const timestamp = Date.now(); // Get the current timestamp in milliseconds
            const uniqueId = prefix + timestamp;
            return uniqueId;
        }
        const orderId = generateOrderId();
        console.log(orderId);

        const newOrder = new Order({
            deliveryDetails,
            user: userId,
            userName: userName,
            products: [{
                productId: products.id,
                count: products.count,
                productPrice:products.productPrice,
                deliveryDate:formattedDeliveryDate,
            }
            ],
            totalAmount:totalAmount,
            date:date,
            paymentMethod:paymentMethod,
            orderId:orderId,
        });
        console.log(newOrder);

        res.redirect('/success');
    } catch (error) {
        console.log(error.message);
    }
};3