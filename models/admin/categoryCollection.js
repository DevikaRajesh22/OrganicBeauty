const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    },
    categoryDescription: {
        type: String,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
}, { strictPopulate: false });

module.exports = mongoose.model('Category', CategorySchema);