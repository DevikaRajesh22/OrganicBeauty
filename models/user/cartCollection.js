const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: "user",
  },
  finalPrice:{
    type:Number,
    required:true,
  },
  subTotal:{
    type:Number,
    required:true,
  },
  shipping:{
    type:Number,
    default:10,
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
  couponApplied:{
    type:String
}
},{strictPopulate : false});

module.exports = mongoose.model("Cart", CartSchema);