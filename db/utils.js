const pool = require('./index'); 

/**
 * grabs products from pgsql database
 * @returns array of JSON
 */
const getProductsDB = async() => {
    try {
        const {rows} = await pool.query('SELECT * FROM products'); 
        return rows; 
    } catch(error){
        console.log(error); 
    }
}

/**
 * returns the session with provided sessionId
 * @param {*} sid 
 * @returns JSON object containing session information
 */
const getSession = async(sid) => { 
    try {
        const {rows} = await pool.query('SELECT sess FROM session WHERE sid = $1', [sid]); 
        if(rows.length !== 0){
            const {sess} = rows[0]; 
            return sess; 
        } else return false; 
    } catch(error){
        console.log(error); 
    }
}

module.exports = {getProductsDB, getSession}; 