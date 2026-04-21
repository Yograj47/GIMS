import request from 'supertest';
import app from '../app.js';
import Supplier from '../models/Supplier.Model.js';
import User from '../models/User.Model.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer, adminToken;

describe('Supplier Controller - Create', () => {
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
        await Supplier.deleteMany({});
    });

    test('Should create a supplier successfully', async () => {
        const supplierData = {
            name: 'Global Supplies Inc',
            email: 'contact@globalsupplies.com',
            phone: '1234567890',
            address: '123 Logistics Way',
            isActive: true
        };

        const response = await request(app)
            .post('/api/v1/suppliers')
            .set('Cookie', [`token=${adminToken}`])
            .send(supplierData);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('Success');
        expect(response.body.data.name).toBe('Global Supplies Inc');
        expect(response.body.data.email).toBe('contact@globalsupplies.com');
    });

    test('Should fail if email already exists', async () => {
        // Pre-seed a supplier
        await Supplier.create({
            name: 'Existing Supplier',
            email: 'duplicate@test.com',
            phone: '0000000000',
            address: 'Old St'
        });

        const response = await request(app)
            .post('/api/v1/suppliers')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                name: 'New Supplier',
                email: 'duplicate@test.com', 
                phone: '1111111111',
                address: 'New St'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('A supplier with this email already exists');
    });

    test('Should fail Zod validation with invalid email format', async () => {
        const response = await request(app)
            .post('/api/v1/suppliers')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                name: 'Bad Email Supplier',
                email: 'not-an-email', 
                phone: '1234567890',
                address: 'Somewhere'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Validation failed'); 
    });
});