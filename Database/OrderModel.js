const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        maxlength: 20,
        trim: true,
        required: true
    },
    items: [
        {
            itemName: {
                type: String,
                maxlength: 80,
                trim: true,
                required: true
            },
            weight: {
                type: Number,
                min: 0.001,
                required: true
            },
            price: {
                type: Number,
                min: 0.01,
                required: true
            },
            quantity: {
                type: Number,
                min: 1,
                required: true
            }
        }
    ],
    amount: {
        type: Number,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

const OrderModel = mongoose.model('orders', orderSchema);

module.exports = OrderModel;
