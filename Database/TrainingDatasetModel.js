const mongoose = require('mongoose');

const trainingDatasetSchema = new mongoose.Schema({
    ses_rec: {
        type: Number,
        required: true
    },
    ses_rec_avg: {
        type: Number,
        required: true
    },
    ses_rec_sd: {
        type: Number,
        required: true
    },
    ses_rec_cv: {
        type: Number,
        required: true
    },
    user_rec: {
        type: Number,
        required: true
    },
    ses_n: {
        type:Number,
        required: true
    },
    int_n: {
        type: Number,
        required: true
    },
    int_n_r: {
        type: Number,
        required: true
    },
    tran_n: {
        type: Number,
        required: true
    },
    tran_n_r: {
        type:Number,
        required: true
    },
    rev_sum: {
        type: Number,
        required: true
    },
    rev_sum_r: {
        type: Number,
        required: true
    },
    target_class: {
        type: Number,
        required: true
    }
});

const TrainingDatasetModel = mongoose.model('trainingDatasets', trainingDatasetSchema);

module.exports = TrainingDatasetModel;
