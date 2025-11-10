const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['match', 'claim', 'system'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
