import Customer from './models/customer.model.js';
import { Op } from 'sequelize';
import Order from '../order/models/order.model.js';

export const getAllCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                { first_name: { [Op.like]: `%${search}%` } },
                { last_name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const customers = await Customer.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: { exclude: ['password_hash'] },
            // Include orders count if possible, or basic info
            // For separate counts like 'totalSpent', we might need more complex queries or associations
            order: [['created_at', 'DESC']],
            distinct: true
        });

        // We can do a quick map to mock totalSpent/ordersCount or fetching them if associations exist
        // For MVP, returning basic customer data is fine, frontend might need to adjust or we calculate here
        // Let's assume frontend just wants the list for now

        res.json({
            total: customers.count,
            pages: Math.ceil(customers.count / limit),
            currentPage: parseInt(page),
            data: customers.rows
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByPk(id, {
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Order, as: 'orders' }]
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, phone, status } = req.body;

        const customer = await Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await customer.update({
            first_name: first_name || customer.first_name,
            last_name: last_name || customer.last_name,
            phone: phone || customer.phone,
            status: status || customer.status // e.g. 'active', 'blocked', 'vip'
        });

        res.json({ message: 'Customer updated successfully', customer });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByPk(id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Ideally, we shouldn't delete customers with orders, but for now we might soft delete or just warn?
        // Let's implement hard delete for now but maybe check for orders?

        await customer.destroy();

        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
