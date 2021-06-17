const client = require('./redis'); 
const {getProductsDB} = require('../db/utils'); 
const {promisify} = require('util'); 
client.get = promisify(client.get); 
client.setex = promisify(client.setex); 

/**
 *
 * @returns [JSON] of products either from redis cache or pgsql db
 */
const getProducts = async() => {
    try {
        const products = await client.get('products'); 
        if(products){
            return JSON.parse(products); 
        } else {
            const productsDB = await getProductsDB(); 
            client.set('products', JSON.stringify(productsDB)); 
            return productsDB
        }
    } catch(error){
        console.log(error); 
    }
}

const addProductQuantity = async(product_id, quantity) => {
    try {
        const products = await getProducts();
        products.find(function(element, index, array){
            if(element.id == product_id){
                element.quantity += quantity
                client.set("products", JSON.stringify(products))
            }
        });
    } catch(error){
        console.log(error.message); 
    }
}

module.exports = {getProducts, addProductQuantity}; 