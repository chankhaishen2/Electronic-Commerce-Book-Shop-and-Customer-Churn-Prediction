const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        maxlength: 80,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: 800,
        required: true,
        trim: true
    },
    weight: {
        type: Number,
        min: 0.001,
        required: true,
    },
    price: {
        type: Number,
        min: 0.01,
        required: true
    },
    quantity: {
        type: Number,
        min: 0,
        required: true,
        validate: {
            validator: function(quantity) {
                return /^\d+$/.test(quantity);
            }
        }
    },
    imageFilename: {
        type: String,
        trim:true
    },
    createdBy: {
        type: String,
        maxlength: 20,
        required: true,
        trim: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    created: {
        type: Date,
        default: Date.now
    }
});

const ItemModel = mongoose.model('items', itemSchema);

module.exports = ItemModel;
