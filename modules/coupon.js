const mongoose = require('mongoose')
const mongooseSchema = mongoose.Schema
const couponSchema = new mongooseSchema({
    code: {
        type: String,
        required: true
    },
    ability: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
    }
})

module.exports = mongoose.model("Coupon", couponSchema)