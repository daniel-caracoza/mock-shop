const app = require("../server"); 
const request = require("supertest"); 
const pool = require('../db/index'); 
const client = require('../cache/redis'); 

describe('GET /products', () => {
    test('should respond with array of JSON objects of products', async() => {
        const response = await request(app).get('/products'); 
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeTruthy(); 
    })
})

describe('GET /cart', () => {
    test('returns shopping cart', async() => {
        const response = await request(app).get('/cart'); 
        console.log(response.body); 
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeTruthy(); 
    })
})


afterAll(() => {
    client.quit();
    pool.end() 
})
