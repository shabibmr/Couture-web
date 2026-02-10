import { app } from '../src/app.js';
import sequelize from '../src/config/database.js';
import request from 'supertest';
import jwt from 'jsonwebtoken';

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        // Use sync({ force: true }) carefully, or maybe just transaction rollback?
        // For now, let's assume the DB schema is up-to-date and we just need connection.
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export const closeDB = async () => {
    await sequelize.close();
};

export const generateToken = (payload: object) => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
};

export const createTestUser = async () => {
    // Implement factory for creating a user
    // This requires importing the User model
    // return user;
};
