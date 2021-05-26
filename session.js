const session = require('express-session');
const pgSession = require('connect-pg-simple') (session)
const pool = require('./db/index')

const sess = {
    secret: process.env.SECRET,
    cookie: { maxAge: 60 * 60 * 1000 },
    saveUninitialized: false,
    resave: false, 
    store: new pgSession({
        pool, 
        tableName: 'session'
    })
}

module.exports = session(sess); 