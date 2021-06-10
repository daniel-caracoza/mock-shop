const getProducts = require('./cache/utils');
const client = require('./cache/redis'); 
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
            const index = products.findIndex(product => product.id == id)
            if(index >= 0){
                req.product_index = index; 
                next(); 
            } else {
                res.status(500).send({msg: "invalid Item"}); 
            }
        }
    } catch(error){
        res.status(500).send({error: error.message}); 
    }
}

const isItemAvailable = async(req, res, next) => {
    const products = await getProducts(); 
    if(products[req.product_index].quantity > 0){
        products[req.product_index].quantity -= 1; 
        client.set("products", JSON.stringify(products))
        next(); 
    } else {
        res.status(500).send({msg: "Insufficient item quantity."})
    }
}

module.exports = {isValidItem, isItemAvailable}; 