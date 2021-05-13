const express = require('express'); 
const router = express.Router();
const db = require('./db');  

router.get('/', (req, res, next) => {
    db.query('SELECT * FROM products', (err, result) => {
        if(err){
            return next(err); 
        }
        res.send(result.rows); 
    })
});

module.exports = router;