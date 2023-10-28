const Order = require("../models/user/orderCollection");
const Cart = require("../models/user/cartCollection");

//orderGet() GET request
exports.orderGet = async (req, res) => {
    try {
        const pageName = "Order";
        const orders = await Order.find();
        res.render("admin/orders", { pageName, orders });
    } catch (error) {
        console.log(error.message);
    }
};

//updateStatus() POST request
exports.updateStatus = async (req, res) => {
    try {
        console.log("update status post request");
        const orderId = req.body.orderId;
        const order = await Order.findOne({ _id: orderId });
        const status = order.status;
        console.log(status);
        if (status === "Shipped") {
            const updatedStatus = await Order.findOneAndUpdate(
                { _id: orderId },
                { $set: { status: "Out for delivery" } }
            );
            res.json({success : true})
        }else if(status==="Out for delivery"){
            const updatedStatus = await Order.findOneAndUpdate(
                { _id: orderId },
                { $set: { status: "Delivered" } }
            );
        }else if(status==="Placed"){
            const updatedStatus = await Order.findOneAndUpdate(
                { _id: orderId },
                { $set: { status: "Shipped" } }
            );
            res.json({success : true})
        }else if(status==="Pending"){
            const updatedStatus=await Order.findOneAndUpdate(
                {_id:orderId},
                {$set:{status:"Placed"}}
            );
            res.json({success:true});
        }
    } catch (error) {
        console.log(error.message);
    }
};

//orderDetails() GET request
exports.orderDetails = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const pageName = "Order";
        const orders = await Order.findOne({ _id: orderId }).populate(
            "products.productId"
        );
        console.log(orders);
        const userId = orders.user;
        const cart = await Cart.findOne({ userId: userId });
        const subTotal = cart.subTotal;
        res.render("admin/orderDetails", { pageName, orders, subTotal });
    } catch (error) {
        console.log(error.message);
    }
};
