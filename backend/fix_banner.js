
import sequelize from './src/config/database.js';
import { DataTypes } from 'sequelize';

const Banner = sequelize.define('Banner', {
    id: { type: DataTypes.UUID, primaryKey: true },
    title: DataTypes.STRING,
    image_url: DataTypes.TEXT,
}, { tableName: 'banners', timestamps: true, underscored: true });

const fixBanner = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Use local image that definitely exists
        const newUrl = "/hero_image.png";

        const [updatedRows] = await Banner.update({ image_url: newUrl }, {
            where: { is_active: true }
        });

        console.log(`Updated ${updatedRows} banner(s).`);
    } catch (error) {
        console.error('Unable to update banner:', error);
    } finally {
        await sequelize.close();
    }
};

fixBanner();
