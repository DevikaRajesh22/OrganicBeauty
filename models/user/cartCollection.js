const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: "user",
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
        default: 0,
      },
    },
  ],
},{strictPopulate : false});

module.exports = mongoose.model("Cart", CartSchema);