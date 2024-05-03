const mongoose = require('mongoose');

const administratorSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        maxlength: 20,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

const AdministratorModel = mongoose.model('administrators', administratorSchema);

module.exports = AdministratorModel;
