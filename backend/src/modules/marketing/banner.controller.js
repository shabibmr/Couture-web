import Banner from './models/banner.model.js';
import { Op } from 'sequelize';
import { deleteImage } from '../system/upload.service.js';
import { BUCKETS } from '../../config/minio.js';

/**
 * Transform banner data from snake_case (database) to camelCase (frontend)
 */
function transformBanner(banner) {
    const data = banner.toJSON ? banner.toJSON() : banner;
    return {
        id: data.id,
        title: data.title,
        description: data.description,
        image: data.image_url,
        link: data.link_url,
        order: data.sort_order,
        isActive: data.is_active,
        start: data.start_date,
        end: data.end_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };
}

/**
 * Transform request data from camelCase (frontend) to snake_case (database)
 */
function transformBannerRequest(data) {
    const transformed = {};

    if (data.title !== undefined) transformed.title = data.title;
    if (data.description !== undefined) transformed.description = data.description;
    if (data.image !== undefined) transformed.image_url = data.image;
    if (data.link !== undefined) transformed.link_url = data.link;
    if (data.order !== undefined) transformed.sort_order = parseInt(data.order) || 0;
    if (data.isActive !== undefined) transformed.is_active = data.isActive;
    if (data.start !== undefined) transformed.start_date = data.start || null;
    if (data.end !== undefined) transformed.end_date = data.end || null;

    return transformed;
}

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

        // Transform to camelCase for frontend
        const transformedBanners = banners.map(transformBanner);
        res.json(transformedBanners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        console.error(error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getBannerById = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByPk(id);

        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        res.json(transformBanner(banner));
    } catch (error) {
        console.error('Error fetching banner:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createBanner = async (req, res) => {
    try {
        const transformedData = transformBannerRequest(req.body);
        console.log('📝 Creating banner with data:', transformedData);
        const banner = await Banner.create(transformedData);
        res.status(201).json(transformBanner(banner));
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

        const transformedData = transformBannerRequest(req.body);
        console.log('📝 Updating banner with data:', transformedData);
        await banner.update(transformedData);
        res.json(transformBanner(banner));
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

        // Store image key before deleting banner
        const imageKey = banner.image_url;

        // Delete banner from database
        await banner.destroy();

        // Delete image from MinIO if it exists
        if (imageKey) {
            try {
                await deleteImage(BUCKETS.BANNERS, imageKey);
                console.log(`🗑️ Deleted image: ${imageKey} from MinIO`);
            } catch (imageError) {
                // Log error but don't fail the request - banner is already deleted
                console.error('Warning: Failed to delete image from MinIO:', imageError);
            }
        }

        res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
