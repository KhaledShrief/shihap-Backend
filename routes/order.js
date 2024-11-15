const express = require("express");
const router = express.Router();
const Order = require("../modules/order");

router.post("/order", async (req, res) => {
    const today = new Date().toLocaleDateString('en-CA');

    try {
        console.log(req.body);
        const order = new Order({
            info: req.body.info,
            cart: req.body.cart,
            total: req.body.total,
            date: today
        });
        await order.save();
        res.json({ success: true, message: "Order submitted successfully" });

    } catch (error) {
        console.error("Error saving order:", error);
        res.json({ success: false, message: "Error saving order" });
    }
});

router.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find({});
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.json({ success: false, message: "Error fetching orders" });
    }
});

router.delete("/order/:id", async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.json({ success: false, message: "Error deleting order" });
    }
});
module.exports = router;