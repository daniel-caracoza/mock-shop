const express = require('express');
const router = express.Router();
const { getSession } = require('../db/utils');
const isValidItem = require('../dataValidation');

router.use('/add', isValidItem); 

/**
 * returns the shopping cart for the session
 * @returns JSON session.cart
 */
router.get('/', async (req, res) => {
    try {
        const session = await getSession(req.sessionID);
        if(session){
            res.status(200).send(session.cart); 
        } else {
            res.status(200).send({msg: `cart is empty.`});
        }
    } catch (error) {
        res.status(500).send({ msg: error.message });
    }
})

/**
 * updates the shopping cart and returns the updated cart
 * @returns JSON session.cart
 */
router.put('/add', (req, res) => {
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
    res.status(200).send(req.session.cart); 

})

module.exports = router;