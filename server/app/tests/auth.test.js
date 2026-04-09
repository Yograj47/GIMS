import request from 'supertest';
import app from '../app.js';
import User from '../models/User.Model.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; 
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

describe('Auth Controller - Login', () => {

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);

        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'Test Admin',
            email: 'admin@gims.com',
            password: hashedPassword,
            role: 'admin'
        });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('Should login successfully with correct credentials', async () => {
        const response = await request(app)
            .post('/api/v1/auths/login')
            .send({
                email: 'admin@gims.com',
                password: 'password123'
            });

        if (response.status !== 200) {
            console.error("Debug Body:", response.body);
        }

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('Success'); 
        expect(response.body.message).toContain('logged in successfully');
    });

    test('Should fail login with wrong password', async () => {
        const response = await request(app)
            .post('/api/v1/auths/login')
            .send({
                email: 'admin@gims.com',
                password: 'wrongpassword'
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid email or password');
    });
});