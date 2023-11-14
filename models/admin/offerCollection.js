const mongoose = require("mongoose");
const OfferSchema = new mongoose.Schema({
  offerName: {
    type: String,
    required: true,
  },
  discountAmount: {
    type: Number,
  },
  activationDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    ref: "Category",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Offer", OfferSchema);
