const express = require('express');
const router = express.Router();
const Products = require('../modules/products');
const multer = require('multer');
const { storage } = require('../cloudinary');

// Initialize multer middleware
const upload = multer({ storage });

router.post('/product', upload.single('imageUrl'), async (req, res) => {
    try {

        const newProduct = new Products({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            imageUrl: req.file.path, // Use req.file.path to get the Cloudinary URL
            category: req.body.Category
        });
        await newProduct.save();
        res.json({ message: 'Product created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating product' });
        console.error('Error creating product:', error);
    }
});
router.get('/products', async (req, res) => {
    try {
        const products = await Products.find({});
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving products' });
    }
});
// Backend Route - Express.js
router.get("/categories", async (req, res) => {
    const { category, name } = req.query; // Extract 'category' and 'name' from query parameters
    console.log("Category:", category, "Name:", name);

    try {
        let query = {};

        // Filter by category if provided
        if (category && category !== "") {
            query.category = category;
        }

        // Add name-based search if 'name' is provided
        if (name && name !== "") {
            query.name = { $regex: name, $options: "i" }; // Case-insensitive search
        }

        const products = await Products.find(query); // Query products based on category and name
        res.status(200).json(products); // Send back the products data

    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "An error occurred while fetching products" });
    }
});


router.get("/product/:id", async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await Products.findById(productId);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "An error occurred while fetching product" });
    }
});
router.delete("/product/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        await Products.findByIdAndDelete(productId);
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while deleting product" });
    }
});

module.exports = router;