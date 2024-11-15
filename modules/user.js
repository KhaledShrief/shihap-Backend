const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    cart: [
        {
            product: {
                _id: mongoose.Schema.Types.ObjectId,
                name: String,
                price: Number,
                imageUrl: String,
                description: String,
            },
            quantity: { type: Number, default: 1 },
        },
    ],
});
module.exports = mongoose.model('User', userSchema);