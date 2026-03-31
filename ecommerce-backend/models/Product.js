const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    mrpPrice: {
        type: Number,
        required: true,
        min: 0
    },
    discountedPrice: {
        type: Number,
        required: true,
        min: 0
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    inStock: {
        type: Boolean,
        default: true
    },
    images: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);