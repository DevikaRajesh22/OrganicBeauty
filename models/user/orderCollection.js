const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  deliveryDetails: {
    type: Object,
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref : 'User'

  },
  uniqueId: {
    type: Number,
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
      deliveryDate: {
        type: Date,
      },
      status: {
        type: String,
        default: "placed",
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
  },
  status: {
    type: String,
  },
  paymentMethod: {
    type: String,
  },
  orderId: {
    type: String,
  }
},{strictPopulate : false});

module.exports = mongoose.model("order", orderSchema);