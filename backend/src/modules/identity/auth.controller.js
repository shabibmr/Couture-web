import jwt from 'jsonwebtoken';
import Customer from './models/customer.model.js';
import Admin from './models/admin.model.js';
import PasswordResetToken from './models/password_reset_token.model.js';
import crypto from 'crypto';
import { Op } from 'sequelize';
import admin from '../../config/firebase.js';

const generateToken = (id, role, type = 'customer') => {
    return jwt.sign({ id, role, type }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

export const registerCustomer = async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone } = req.body;

        const existingCustomer = await Customer.findOne({ where: { email } });
        if (existingCustomer) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const customer = await Customer.create({
            first_name,
            last_name,
            email,
            password_hash: password,
            phone,
        });

        const token = generateToken(customer.id, 'customer');

        res.status(201).json({
            message: 'Customer registered successfully',
            token,
            user: {
                id: customer.id,
                email: customer.email,
                first_name: customer.first_name,
                last_name: customer.last_name,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        const customer = await Customer.findOne({ where: { email } });
        if (!customer) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await customer.validatePassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(customer.id, 'customer');

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: customer.id,
                email: customer.email,
                first_name: customer.first_name,
                last_name: customer.last_name,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ where: { email } });
        if (!admin || !admin.is_active) {
            return res.status(401).json({ message: 'Invalid credentials or inactive account' });
        }

        const isValid = await admin.validatePassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(admin.id, admin.role, 'admin');

        res.json({
            message: 'Admin Login successful',
            token,
            user: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error('Admin Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const customer = await Customer.findOne({ where: { email } });

        if (!customer) {
            // Generous response to avoid user enumeration, but in mock we log
            console.log(`Password reset requested for non-existent email: ${email}`);
            return res.json({ message: 'If that email exists in our system, a reset link has been sent.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires_at = new Date(Date.now() + 3600000); // 1 hour

        await PasswordResetToken.create({
            customer_id: customer.id,
            token, // In production, hash this
            expires_at,
        });

        // Mock email sending
        console.log(`[MOCK EMAIL] To: ${email}, Reset Token: ${token}`);

        res.json({ message: 'If that email exists in our system, a reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const syncFirebaseUser = async (req, res) => {
    try {
        const { idToken } = req.body;

        // Verify Firebase Token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, picture, uid, email_verified } = decodedToken;

        // Split name into first and last
        const nameParts = (name || '').split(' ');
        const first_name = nameParts[0] || 'User';
        const last_name = nameParts.slice(1).join(' ') || '';

        // Find or create customer
        let [customer, created] = await Customer.findOrCreate({
            where: { email },
            defaults: {
                first_name,
                last_name,
                email,
                email_verified: email_verified || false,
                oauth_provider: 'firebase',
                oauth_provider_id: uid,
                avatar_url: picture
            }
        });

        // If customer exists but wasn't created now, update their info if needed
        if (!created) {
            customer.oauth_provider = 'firebase';
            customer.oauth_provider_id = uid;
            if (picture) customer.avatar_url = picture;
            await customer.save();
        }

        const token = generateToken(customer.id, 'customer');

        res.json({
            message: created ? 'User registered and synced' : 'User synced successfully',
            token,
            user: {
                id: customer.id,
                email: customer.email,
                first_name: customer.first_name,
                last_name: customer.last_name,
                avatar_url: customer.avatar_url
            },
        });
    } catch (error) {
        console.error('Firebase sync error:', error);
        res.status(401).json({ message: 'Invalid Firebase token', error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const resetToken = await PasswordResetToken.findOne({
            where: {
                token,
                used: false,
                expires_at: { [Op.gt]: new Date() }
            }
        });

        if (!resetToken) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const customer = await Customer.findByPk(resetToken.customer_id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        customer.password_hash = newPassword; // Automatically hashed by hooks
        await customer.save();

        resetToken.used = true;
        await resetToken.save();

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        // req.user is populated by authenticate middleware
        const customer = await Customer.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!customer) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(customer);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateCurrentUser = async (req, res) => {
    try {
        const { first_name, last_name, phone } = req.body;
        const customer = await Customer.findByPk(req.user.id);

        if (!customer) {
            return res.status(404).json({ message: 'User not found' });
        }

        customer.first_name = first_name || customer.first_name;
        customer.last_name = last_name || customer.last_name;
        customer.phone = phone || customer.phone;

        await customer.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: customer.id,
                email: customer.email,
                first_name: customer.first_name,
                last_name: customer.last_name,
                phone: customer.phone
            }
        });
    } catch (error) {
        console.error('Update current user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
