import Notification from './models/notification.model.js';
import { getUserNotifications, markAsRead, deleteNotification } from './services/notification.service.js';

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { unread_only } = req.query;

        const notifications = await getUserNotifications(userId, unread_only === 'true');
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await markAsRead(id, userId);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(error.message === 'Notification not found' ? 404 : 500).json({ message: error.message || 'Server error' });
    }
};

export const removeNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const deleted = await deleteNotification(id, userId);
        if (deleted) {
            res.json({ message: 'Notification deleted' });
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
