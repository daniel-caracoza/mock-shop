require('dotenv').config();
const express = require('express');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const checkoutRouter = require('./routes/checkout'); 
const app = express();
const {sess} = require('./session');
const { json } = require('express');

app.use(express.urlencoded({ extended: false }));
app.use(sess); 
app.use('/products', productsRouter);
app.use('/cart', cartRouter); 
app.use('/checkout', checkoutRouter); 

module.exports = app; 