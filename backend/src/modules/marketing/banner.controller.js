import Banner from './models/banner.model.js';
import { Op } from 'sequelize';

export const getBanners = async (req, res) => {
    try {
        const { active } = req.query;
        const whereClause = {};

        if (active === 'true') {
            whereClause.is_active = true;
            whereClause.start_date = { [Op.or]: [null, { [Op.lte]: new Date() }] };
            whereClause.end_date = { [Op.or]: [null, { [Op.gte]: new Date() }] };
        }

        const banners = await Banner.findAll({
            where: whereClause,
            order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
        });
        res.json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        console.error(error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createBanner = async (req, res) => {
    try {
        const banner = await Banner.create(req.body);
        res.status(201).json(banner);
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByPk(id);

        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        await banner.update(req.body);
        res.json(banner);
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByPk(id);

        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        await banner.destroy();
        res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
