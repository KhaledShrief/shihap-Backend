const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    info: {
        email: String,
        firstName: String,
        lastName: String,
        address: String,
        country: String,
        governorate: String,
        phone: String,
    },
    cart: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            name: String,
            description: String,
            price: Number,
            imageUrl: String,
            category: String,
            quantity: Number,
        },
    ],
    total: Number,
    date: String,
});

module.exports = mongoose.model("Order", orderSchema);
