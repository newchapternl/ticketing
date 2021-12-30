import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

declare global {
    var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');
//jest.mock('../stripe');

process.env.STRIPE_KEY = 'sk_test_51KBcP6LZkMxwRcZOpflBrhiidpizQbE7P6cFaR6TWXT8K83H3ljY6V2GvE0C1G3uzF04chqifXKrwcqUiwEFZfu200NVbX0Qn1';

let mongo: any;

beforeAll(async () => {
    process.env.JWT_KEY = 'whateverstring';
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signin = (id?: string) => {
    // Build a JWT payload {id, email }
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }

    // Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!);


    // Build session object { jwt: MY_JWT }
    const session = { jwt: token };

    // Turn session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // Return a string that's the cookie with the encoded data
    return [`express:sess=${base64}`];

};