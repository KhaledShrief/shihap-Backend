require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const session = require('express-session');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products.js');
const orderRoutes = require('./routes/order.js');
const couponRoutes = require('./routes/coupon.js');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/shihap'

mongoose.connect(dbUrl).then(() => console.log('MongoDB connected')).catch(err => console.log(err));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: false

    }
}));
app.use(cors({
    origin: process.env.Frontend_URL, // Replace with your Next.js frontend URL
    credentials: true, // Enable credentials (cookies) to be sent
}));
app.use('/', productsRoutes);
app.use('/', authRoutes);
app.use('/', orderRoutes);
app.use('/', couponRoutes);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('deployed successfully')
})
//routes//
app.get('/session', (req, res) => {
    console.log(process.env.Frontend_URL)

    if (!req.session) {
        res.status(401).send({ message: 'Unauthorized' })
    }
    else {
        res.status(200).send({ session: req.session })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});