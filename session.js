const session = require('express-session');
const pgSession = require('connect-pg-simple') (session)
const pool = require('./db/index')

const sess = session ({
    secret: process.env.SECRET,
    cookie: { maxAge: 60 * 60 * 1000 },
    saveUninitialized: true,
    resave: false, 
    store: new pgSession({
        pool, 
        tableName: 'session'
    })
}); 

const initSession = (req, res, next) => {
    if (!req.session.cart) {
        const cart = {
            products: [],
            total: 0.0
        };
        req.session.cart = cart;
    }
    req.session.save(); 
    next(); 
}

module.exports = {sess, initSession}; 