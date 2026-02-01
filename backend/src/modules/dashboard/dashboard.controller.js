import Order from '../order/models/order.model.js';
import Customer from '../identity/models/customer.model.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue (Sum of completed/confirmed orders)
        // Adjust status filter as per business logic
        const revenueResult = await Order.sum('total_amount', {
            where: {
                status: {
                    [Op.notIn]: ['cancelled', 'refunded']
                }
            }
        });
        const totalRevenue = revenueResult || 0;

        // 2. Total Orders (Count of all orders)
        const totalOrders = await Order.count();

        // 3. New Orders (Count of orders created in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newOrdersCount = await Order.count({
            where: {
                order_date: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        // 4. Total Customers
        const totalCustomers = await Customer.count();

        // 5. Growth (Simple mock calculation or comparison with previous month)
        // For MVP, returning a static or simple calculated field
        // Real implementation would compare current month revenue vs last month
        const growth = 12.5; // Mock value for now

        res.json({
            revenue: totalRevenue,
            orders: newOrdersCount, // Using "New Orders" for the dashboard card
            totalOrders: totalOrders,
            customers: totalCustomers,
            growth: growth
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};
