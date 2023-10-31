const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    price: {
        type: Number,
        required: true
    },
    productDetails: {
        type: String,
        required: true
    },
    image :{
        image1 :{
            type : String,
            required : true
        },
        image2 :{
            type : String,
            required : true
        },
        image3 : {
            type : String,
            required : true
        },
        image4 : {
            type : String,
            required : true
        }
        
    },
    stock: {
        type: Number,
        required: true
    },
    isList:{
        type:Boolean,
        default:true,
    }
});

module.exports = mongoose.model('Product', ProductSchema);