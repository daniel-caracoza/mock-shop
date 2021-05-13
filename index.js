require('dotenv').config();
const express = require('express');
const productsRouter = require('./products');
const pool = require('./db/index')
const app = express();
const session = require('express-session');
const { json } = require('express');
const port = 3000;
const pgSession = require('connect-pg-simple') (session)

app.use(session({
    secret: process.env.SECRET,
    cookie: { maxAge: 60 * 60 * 1000 },
    saveUninitialized: false,
    resave: false, 
    store: new pgSession({
        pool, 
        tableName: 'session'
    })
}));

app.use(express.urlencoded({ extended: false }));
app.use('/products', productsRouter);

app.get('/shoppingCart', (req, res) => {
    const getCartQueryText = 'SELECT sess FROM session WHERE sid =$1'; 
    (async () => {
        const {rows} = await pool.query(getCartQueryText, [req.sessionID]);
        const {sess} = rows[0]; 
        res.status(200).send(sess.cart); 
    })().catch(err => 
        setImmediate(() => {throw err})
    )
})

app.post('/addToShoppingCart', (req, res) => {
    const { id, price } = req.body;
    //if shopping cart exists 
    if (!req.session.cart) {
        const cart = {
            products: [],
            total: 0.0
        };
        req.session.cart = cart;
    }
    let found = req.session.cart.products.find(({ product_id }) => product_id === id);
    if (found) {
        found.quantity += 1;
    } else {
        const new_item = { product_id: id, quantity: 1 };
        req.session.cart.products.push(new_item);
    }
    req.session.cart.total += parseFloat(price);
    res.status(200).send(req.session);
})

app.post('/checkout', (req, res) => {
    const { first_name, last_name, email, address, city, state, zip } = req.body;
    const products = req.session.cart.products;
    const payment_total = req.session.cart.total;
    (async () => {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            const insertCustomerQueryText = 'INSERT INTO customers(first_name, last_name, email, address, city, state, zip) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id';
            const res_customer_id = await client.query(insertCustomerQueryText, [first_name, last_name, email, address, city, state, zip]);
            const insertPaymentQueryText = 'INSERT INTO payments(amount) VALUES($1) RETURNING id';
            const res_payment_id = await client.query(insertPaymentQueryText, [payment_total]);
            const insertOrderQueryText = 'INSERT INTO orders(payment_id) VALUES($1) RETURNING id';
            const res_order_id = await client.query(insertOrderQueryText, [res_payment_id.rows[0].id]);
            const insertCustomerOrderQueryText = 'INSERT INTO customers_orders(customer_id, order_id) VALUES($1, $2)';
            await client.query(insertCustomerOrderQueryText, [res_customer_id.rows[0].id, res_order_id.rows[0].id]);
            const insertOrdersProductsQueryText = 'INSERT INTO orders_products(order_id, product_id, quantity) VALUES ($1, $2, $3)';
            if (products) {
                for (let i = 0; i < products.length; i++) {
                    await client.query(insertOrdersProductsQueryText, [res_order_id.rows[0].id, products[i].product_id, products[i].quantity]);
                }
            }
            await client.query('COMMIT');
            res.status(203).json({ msg: 'Checkout process completed' });
        } catch (e) {
            await client.query('ROLLBACK')
            res.status(422).json({ msg: 'Unprocessable Entity: invalid data in payload' });
            throw e;
        } finally {
            client.release()
        }
    })().catch(e => console.error(e.stack))
})

app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
});