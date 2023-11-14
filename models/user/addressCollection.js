const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  address: [
    {
      country: { type: String, required: true },
      state: { type: String, required: true },
      apartment: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
      zipcode: { type: String, required: true },
      type: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("Address", AddressSchema);
