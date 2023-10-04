const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true },
    categoryDescription: { type: String, required: true },
    isBlocked: {
        type: Boolean,
        default: false, // Initially, users are not blocked
      },
}, { strictPopulate: false });

module.exports = mongoose.model('Category', CategorySchema);