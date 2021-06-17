const express = require('express'); 
const router = express.Router();
const {getProducts} = require('../cache/utils'); 

router.get('/', async (req, res) => {
    try {
        const products = await getProducts(); 
        res.status(200).send(products);
    } catch(error){
        res.status(500).send({msg: error}); 
    }
}); 

module.exports = router;