const express = require('express');
const router = express.Router();
const { getSession } = require('../db/utils');
const {isValidItem} = require('../dataValidation');
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
router.put('/add',[initSession, isValidItem],  async(req, res) => {
    const {id} = req.body;
    const cart_prod = req.cart_prod; 

    try {
        const dbSession = await getSession(req.sessionID);
        if(dbSession){
            let found = dbSession.cart.products.find(({ product_id }) => product_id == id);
            if (found) {
                found.quantity += 1;
            } else {
                const new_item = {
                    product_id: cart_prod.id, 
                    product_name: cart_prod.product_name, 
                    price: cart_prod.price, 
                    img_url: cart_prod.img_url, 
                    quantity: 1
                }
                dbSession.cart.products.push(new_item);
            }
            dbSession.cart.total += parseFloat(cart_prod.price);
            req.session.cart = dbSession.cart; 
            res.status(200).send(dbSession.cart);
        } else {
            res.status(500).send({msg: 'session not found'}); 
        }

    } catch(error){
        res.status(500).send(error.message); 
    }
})

/**
 * @param id
 * removes the cart item associated to the given product id
 */
router.put('/remove/:id', [initSession], async(req, res) => {
    const {id} = req.params; 
    try {
        const dbSession = await getSession(req.sessionID);
        const cartProducts = dbSession.cart.products; 
        const result = cartProducts.filter((element) => {
            if(element.product_id == id){
                dbSession.cart.total -= element.price; 
            }
            return element.product_id != id; 
        });
        dbSession.cart.products = result; 
        req.session.cart = dbSession.cart; 
        req.session.save(); 
        res.status(200).send(req.session.cart); 
    } catch(error){
        res.send(error.message); 
    }
})

module.exports = router;