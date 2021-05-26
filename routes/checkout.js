const pool = require('../db/index');
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
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
                for (const element in products) {
                    await client.query(insertOrdersProductsQueryText, [res_order_id.rows[0].id, element.product_id, element.quantity])
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

module.exports = router; 