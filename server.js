require('dotenv').config();
const express = require('express');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const checkoutRouter = require('./routes/checkout'); 
const app = express();
const {sess} = require('./session');
const { json } = require('express');

app.use(express.json());
app.use(sess); 
app.use('api/v1/products', productsRouter);
app.use('api/v1/cart', cartRouter); 
app.use('api/v1/checkout', checkoutRouter); 

module.exports = app; 