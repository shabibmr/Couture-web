import Notification from '../models/notification.model.js';

export const createNotification = async (userId, type, title, message, metadata = {}) => {
    try {
        const notification = await Notification.create({
            user_id: userId,
            type,
            title,
            message,
            metadata,
            read: false
        });
        console.log(`Notification created for user ${userId}:`, type);
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

export const markAsRead = async (notificationId, userId) => {
    try {
        const notification = await Notification.findOne({
            where: { id: notificationId, user_id: userId }
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        await notification.update({ read: true });
        return notification;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

export const getUserNotifications = async (userId, unreadOnly = false) => {
    try {
        const where = { user_id: userId };
        if (unreadOnly) {
            where.read = false;
        }

        const notifications = await Notification.findAll({
            where,
            order: [['created_at', 'DESC']],
            limit: 50
        });

        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const deleteNotification = async (notificationId, userId) => {
    try {
        const result = await Notification.destroy({
            where: { id: notificationId, user_id: userId }
        });

        return result > 0;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};
