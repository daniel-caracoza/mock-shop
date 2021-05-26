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
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeTruthy(); 
    })
})

describe('PUT /cart/add', () => {
    const testProductId = '1'; 
    const testProductPrice = '3.50'; 
    test('add an item to shopping cart', async() => {
        const response = await request(app).put('/cart/add')
        .send({id:testProductId, price: testProductPrice});
        expect(response.statusCode).toBe(200); 
        expect(response.body.products).toBeTruthy(); 
    })
})

afterAll(() => {
    client.quit();
    pool.end() 
})
