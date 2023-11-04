const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  deliveryDetails: {
    type: Object,
    required: true,
  },
  user: {
    type: String,
    ref: 'User'
  },
  discountCode:{
    type:String,
  },
  discountPrice:{
    type:String,
  },
  userName: {
    type: String,
    required: true,
  },
  products: [
    {
      productId: {
        type: String,
        required: true,
        ref: "Product",
      },
      count: {
        type: Number,
        default: 1,
      },
      productPrice: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    default: "Pending",
  },
  deliveryDate: {
    type: Date,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
  },
  paymentMethod: {
    type: String,
  },
  orderId: {
    type: String,
  }
}, { strictPopulate: false });

module.exports = mongoose.model("Order", orderSchema);