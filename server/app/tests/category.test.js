import request from 'supertest';
import app from '../app.js';
import Category from '../models/Category.Model.js';
import User from '../models/User.Model.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer, adminToken;

describe('Category Controller - Create', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());

        // Create an Admin user to get a real ID for the log
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@gims.com',
            password: 'password123',
            role: 'admin' // Required for Private/Admin access
        });

        // Generate a token for the request
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

    test('Should create a category successfully as an Admin', async () => {
        const response = await request(app)
            .post('/api/v1/categories')
            .set('Cookie', [`token=${adminToken}`]) // Sending JWT via cookie
            .send({
                name: 'Dairy',
                description: 'Milk and cheese products'
            });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('Success');
        expect(response.body.data.name).toBe('Dairy');
    });

    test('Should fail if category name already exists', async () => {
        // First, we ensure 'Dairy' exists (from previous test or create here)
        const response = await request(app)
            .post('/api/v1/categories')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                name: 'Dairy',
                description: 'Duplicate test'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Category name already exists');
    });

    test('Should fail Zod validation with empty name', async () => {
        const response = await request(app)
            .post('/api/v1/categories')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                name: '', // Invalid per Zod
                description: 'No name'
            });

        expect(response.status).toBe(400);
        // Depending on your Global Error Handler, check for Zod error details
        expect(response.body).toHaveProperty('message');
    });
});