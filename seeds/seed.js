const mongoose = require('mongoose');
const Products = require('../modules/products.js');
mongoose.connect('mongodb://127.0.0.1:27017/shihap').then(() => console.log('MongoDB connected')).catch(err => console.log(err));


const products = [
    {
        name: 'Shoes',
        description: 'Shoes lorem ikdsnvkljdsnvlkdsnvlkndslkvnlkdsnvlkdsnvlkdsnvlkdnlkvndslkvnlkdnvlkdsnvlkdsnvlkdsnvkndslknvlkdsnvlkdsnvlkdsnvlkdsnvlksn are a must-have for any fashion-conscious individual. They provide comfort, style, and versatility, making them a staple in any wardrobe.',
        price: 100,
        imageUrl: '/shoes.avif',
        category: 'clothing',
    },
]

const seed = async () => {
    try {
        await Products.deleteMany({});
        for (let i = 0; i < 10; i++) {
            const data = await new Products({
                name: products[0].name,
                description: products[0].description,
                price: products[0].price,
                imageUrl: products[0].imageUrl,
                category: products[0].category,
            })
            data.save();
        }

        console.log('Products seeded successfully!');
    }
    catch (error) {
        console.error('Error seeding products:', error);
    }
}
seed();