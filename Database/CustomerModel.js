const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        maxlength: 20,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    cartItems: [
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
    logoutTimeStamps: [
        {
            timeStamp: {
                type: Date,
                required: true
            }
        }
    ],
    interactionTimeStamps: [
        {
            timeStamp: {
                type: Date,
                required: true
            }
        }
    ],
    transactions: [
        {
            amount: {
                type: Number,
                required: true
            },
            timeStamp: {
                type: Date,
                required: true
            }
        }
    ],
    created: {
        type: Date,
        default: Date.now
    }
});

const CustomerModel = mongoose.model('customers', customerSchema);

module.exports = CustomerModel;
