import request from 'supertest';
import app from '../app.js';
import Category from '../models/Category.Model.js';
import Unit from '../models/Unit.Model.js';
import Product from '../models/Product.Model.js';
import User from '../models/User.Model.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer, adminToken, testCategory, testUnit;

describe('Product Controller - Create', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@gims.com',
            password: 'password123',
            role: 'admin'
        });

        adminToken = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET || 'testsecret',
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        // 1. Clear collections
        await Product.deleteMany({});
        await Category.deleteMany({});
        await Unit.deleteMany({});

        // 2. Pre-seed dependencies
        testCategory = await Category.create({ 
            name: 'Electronics', 
            description: 'Gadgets' 
        });

        testUnit = await Unit.create({ 
            name: 'Piece', 
            shortForm: 'pc',
            multiplierToBase: 1,
            isFractional: false 
        });
    });

    test('Should create a product successfully with all valid dependencies', async () => {
        const productData = {
            name: 'Smartphone',
            categoryId: testCategory._id.toString(),
            unitId: testUnit._id.toString(),
            quantity: 10,
            threshold: 2,
            basePrice: 500,
            sellingPrice: 700
        };

        const response = await request(app)
            .post('/api/v1/products')
            .set('Cookie', [`token=${adminToken}`])
            .send(productData);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('Success');
        expect(response.body.data.name).toBe('Smartphone');
        // Verify quantity is stored correctly
        expect(response.body.data.quantity).toBe(10);
    });

    test('Should fail if Category ID does not exist', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        
        const response = await request(app)
            .post('/api/v1/products')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                name: 'Ghost Product',
                categoryId: fakeId.toString(),
                unitId: testUnit._id.toString(),
                quantity: 5,
                threshold: 1,
                basePrice: 10,
                sellingPrice: 15
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Category not found');
    });

    test('Should fail if Unit ID does not exist', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        
        const response = await request(app)
            .post('/api/v1/products')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                name: 'Ghost Product',
                categoryId: testCategory._id.toString(),
                unitId: fakeId.toString(),
                quantity: 5,
                threshold: 1,
                basePrice: 10,
                sellingPrice: 15
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Unit not found');
    });

    test('Should fail Zod validation if sellingPrice is missing', async () => {
        const response = await request(app)
            .post('/api/v1/products')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                name: 'Cheap Product',
                categoryId: testCategory._id.toString(),
                unitId: testUnit._id.toString(),
                quantity: 5,
                threshold: 1,
                basePrice: 10
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Validation failed');
    });
});