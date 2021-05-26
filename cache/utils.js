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
            client.setex('products', 60, JSON.stringify(productsDB)); 
            return productsDB
        }
    } catch(error){
        console.log(error); 
    }
}

module.exports = getProducts; 