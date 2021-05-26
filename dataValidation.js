const getProducts = require('./cache/utils');

/**
 * middleware function for /cart/add to check if item(id) is valid before adding to cart. 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const isValidItem = async(req, res, next) => {
    const {id} = req.body; 
    try {
        const products = await getProducts(); 
        if(products){
            const found = products.find(function(product, index){
                return product.id == id; 
            })
            if(found){
                console.log("item validated!"); 
                next(); 
            } else {
                res.status(500).send({msg: "invalid Item"}); 
            }
        }
        
    } catch(error){
        res.status(500).send({error: error.message}); 
    }
}

module.exports = isValidItem; 