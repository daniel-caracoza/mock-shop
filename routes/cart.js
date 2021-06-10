const express = require('express');
const router = express.Router();
const { getSession } = require('../db/utils');
const {isValidItem, isItemAvailable} = require('../dataValidation');
const {initSession} = require('../session'); 


/**
 * returns the shopping cart for the session
 * @returns JSON session.cart
 */
router.get('/', initSession,  async (req, res) => {
    try {
        const session = await getSession(req.sessionID);
        res.status(200).send(session.cart); 
    
    } catch (error) {
        res.status(500).send({ msg: error.message });
    }
})

/**
 * updates the shopping cart and returns the updated cart
 * @returns JSON session.cart
 */
router.put('/add',[initSession, isValidItem, isItemAvailable],  async(req, res) => {
    const { id, price } = req.body;
    try {
        const dbSession = await getSession(req.sessionID);
        if(dbSession){
            let found = dbSession.cart.products.find(({ product_id }) => product_id === id);
            if (found) {
                found.quantity += 1;
            } else {
                const new_item = { product_id: parseInt(id), quantity: 1 };
                dbSession.cart.products.push(new_item);
            }
            dbSession.cart.total += parseFloat(price);
            req.session.cart = dbSession.cart; 
            res.status(200).send(dbSession.cart);
        } else {
            res.status(500).send({msg: 'session not found'}); 
        }

    } catch(error){
        res.status(500).send(error.message); 
    }
})

module.exports = router;