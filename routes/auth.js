const express = require('express');
const router = express.Router();
const User = require('../modules/user.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const Products = require('../modules/products');
const { ObjectId } = require('mongoose').Types; // Import ObjectId from mongoose


router.use(express.json());
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], 'your_jwt_secret'); // Split because token comes as 'Bearer <token>'
        req.user = decoded; // Attach user info to the request
        next(); // Proceed to the next middleware/route
    } catch (err) {
        return res.status(400).json({ message: 'Invalid token.' });
    }
};



router.post('/register', async (req, res) => {
    const { email, password, confirm } = req.body;
    req.session.returnTo = req.originalUrl
    let redirectUrl = `${process.env.Frontend_URL}/${req.session.returnTo}` || `${process.env.Frontend_URL}/`
    try {
        if (password !== confirm) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        const user = new User({ email, password, cart: [] });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });

        return res.status(200).json({ redirectUrl: `${req.session.returnTo === "/register" || req.session.returnTo === "/login" ? process.env.Frontend_URL : redirectUrl}/`, token });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    req.session.returnTo = req.originalUrl
    let redirectUrl = `${process.env.Frontend_URL}/${req.session.returnTo}` || `${process.env.Frontend_URL}/`
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
        return res.status(200).json({ redirectUrl: `${req.session.returnTo === "/register" || req.session.returnTo === '/login' ? process.env.Frontend_URL : redirectUrl}/`, token });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

router.get('/user', authMiddleware, (req, res) => {
    // Now you have access to req.user which has the user info from the JWT
    const userId = req.user.userId;

    // Fetch user-specific content from the database
    User.findById(userId).then(user => {
        res.status(200).json({ message: `Welcome ${user.email}`, user });
    }).catch(err => {
        res.status(500).json({ message: 'Error fetching user.' });
    });
});
router.post('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }

        // Optionally clear the cookie if you're using one for session
        res.clearCookie('connect.sid'); // 'connect.sid' is the default session cookie name

        return res.status(200).json({ message: 'Logged out successfully' });
    });
});

// Assuming you already have the `authMiddleware` for logged-in users

// Add item to cart
// Add item to cart
router.post('/cart', authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;

    try {
        const user = await User.findById(userId);
        const product = await Products.findById(productId);

        if (!product) return res.status(404).json({ message: "Product not found" });

        const existingItem = user.cart.find(item => item.product._id == productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            user.cart.push({ product, quantity });
        }

        await user.save();
        res.status(200).json({ message: "Product added to cart", cart: user.cart });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ message: error.message });
    }
});

router.put('/user', authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const { quantity, cartItemId } = req.body;

    try {
        // Find user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Log cart contents for debugging
        console.log("User Cart Contents:", user.cart);

        // Convert cartItemId to an ObjectId
        const convertedCartItemId = new ObjectId(cartItemId);
        console.log("Converted CartItemId:", convertedCartItemId);

        // Check each cart item's _id and compare it to the convertedCartItemId
        const cartItem = user.cart.find(item => {
            console.log("Comparing with cart item ID:", item._id);
            return item._id.equals(convertedCartItemId);
        });

        console.log("Found Cart Item:", cartItem); // Should log the found cart item or undefined

        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        // Update the quantity
        cartItem.quantity = quantity;

        // Save the updated user document
        await user.save();

        // Respond with the updated cart
        res.status(200).json({ user });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ message: "An error occurred while updating the cart" });
    }
});


// Remove item from cart
router.delete('/cart/:cartItemId', authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const { cartItemId } = req.params;

    try {
        // Use the cart item's own _id for deletion
        await User.findByIdAndUpdate(userId, {
            $pull: { cart: { _id: cartItemId } }
        });
        res.status(200).json({ message: "Product removed from cart" });
    } catch (error) {
        console.error("Error deleting product from cart:", error);
        res.status(500).json({ message: error.message });
    }
});

router.delete("/empty-cart", authMiddleware, async (req, res) => {
    const userId = req.user.userId; // Assuming user ID is available from auth middleware
    console.log(userId);
    try {
        await User.updateOne({ _id: userId }, { $set: { cart: [] } }); // Clear cart array
        res.json({ success: true, message: "Cart cleared successfully" });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ success: false, message: "Error clearing cart" });
    }
});


module.exports = router;