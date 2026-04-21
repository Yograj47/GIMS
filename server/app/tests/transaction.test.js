import request from 'supertest';
import app from '../app.js';
import Product from '../models/Product.Model.js';
import Transaction from '../models/Transaction.Model.js';
import Movement from '../models/Movement.Model.js';
import User from '../models/User.Model.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryReplSet } from 'mongodb-memory-server'; // ✅ Using ReplSet

let mongoServer, adminToken, testProduct;

describe('Unified Transaction Controller', () => {
    beforeAll(async () => {
        // 1. Initialize Replica Set for Transactions
        mongoServer = await MongoMemoryReplSet.create({
            replSet: { count: 1, storageEngine: 'wiredTiger' }
        });

        const uri = mongoServer.getUri();
        await mongoose.connect(uri);

        // 2. Setup Admin User
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });

        adminToken = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET || 'testsecret'
        );
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await Product.deleteMany({});
        await Transaction.deleteMany({});
        await Movement.deleteMany({});

        // Seed a product for testing stock impacts
        testProduct = await Product.create({
            name: 'Test Item',
            quantity: 100,
            basePrice: 10,
            sellingPrice: 20,
            categoryId: new mongoose.Types.ObjectId(),
            unitId: new mongoose.Types.ObjectId()
        });
    });

    test('Should successfully process a SALE (Transaction & Stock Update)', async () => {
        const saleData = {
            transactionType: 'Sale',
            grandTotal: 40,
            isPaid: true,
            items: [{
                productId: testProduct._id.toString(),
                unitId: testProduct.unitId.toString(),
                qty: 2,
                multiplier: 1,
                rate: 20,      // ✅ was 'price'
                total: 40,     // ✅ was 'baseQuantity'
            }]
        };

        const response = await request(app)
            .post('/api/v1/transactions')
            .set('Cookie', [`token=${adminToken}`])
            .send(saleData);

        expect(response.status).toBe(201);

        // Check Product update
        const updatedProduct = await Product.findById(testProduct._id);
        expect(updatedProduct.quantity).toBe(98);

        // Check Movement entry
        const movement = await Movement.findOne({ productId: testProduct._id });
        expect(movement.movementType).toBe('OUT');
    });

    test('Should abort and rollback if stock becomes negative', async () => {
        const excessiveSale = {
            transactionType: 'Sale',
            grandTotal: 5000,
            isPaid: false,     // ✅ was missing
            items: [{
                productId: testProduct._id.toString(),
                unitId: testProduct.unitId.toString(),
                qty: 200,
                multiplier: 1,
                rate: 25,      // ✅ was 'price'
                total: 5000,   // ✅ was 'baseQuantity'
            }]
        };
        const response = await request(app)
            .post('/api/v1/transactions')
            .set('Cookie', [`token=${adminToken}`])
            .send(excessiveSale);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Insufficient stock');

        // VERIFY ROLLBACK: Transaction should NOT exist
        const transactionCount = await Transaction.countDocuments();
        expect(transactionCount).toBe(0);

        // VERIFY ROLLBACK: Stock should still be 100
        const revertedProduct = await Product.findById(testProduct._id);
        expect(revertedProduct.quantity).toBe(100);
    });
});