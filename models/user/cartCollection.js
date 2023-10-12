const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: "user",
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
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
      totalPrice:{
        type: Number,
        required: true,
      }
    },
  ],
},{strictPopulate : false});

module.exports = mongoose.model("Cart", CartSchema);