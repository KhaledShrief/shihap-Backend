const Coupon = require('../modules/coupon')
const express = require('express')
const router = express.Router()

router.post('/add-coupon', (req, res) => {
    const { code, ability, discount } = req.body
    try {

        const newCoupon = new Coupon({
            code,
            ability,
            discount
        })
        newCoupon.save()
        res.status(200).send({ message: 'Coupon created successfully' })
    } catch (error) {
        console.error("Error fetching coupons:", error);
        res.json({ success: false, message: "Error fetching orders" });
    }
})

router.get('/coupons', async (req, res) => {
    try {

        const coupons = await Coupon.find({})
        res.send(coupons)
    } catch (error) {
        console.error("Error fetching coupons:", error);
        res.json({ success: false, message: "Error fetching coupons" });
    }
})

router.delete('/coupon/:id', async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id)
        res.json({ message: 'Coupon deleted successfully' })
    } catch (error) {
        console.error("Error deleting coupon:", error);
        res.json({ success: false, message: "Error deleting coupon" });
    }
})

module.exports = router;