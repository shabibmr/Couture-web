import sequelize from '../config/database';
import Setting from '../modules/system/settings.model.js';

const defaultSettings = [
    { key: 'contact_email', value: 'info@ruveracouture.com', description: 'Contact Email Address' },
    { key: 'contact_phone', value: '+919895558511', description: 'Contact Phone Number' },
    { key: 'contact_whatsapp', value: '+919895558533', description: 'WhatsApp Number' },
    { key: 'contact_address', value: '123 Fashion Avenue, Mumbai, Maharashtra 400001, India', description: 'Store Address' },
    { key: 'social_instagram', value: 'https://instagram.com/ruveracouture', description: 'Instagram URL' },
    { key: 'social_facebook', value: 'https://facebook.com/ruveracouture', description: 'Facebook URL' },
    { key: 'social_twitter', value: 'https://twitter.com/ruveracouture', description: 'Twitter URL' }
];

const seedSettings = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        for (const setting of defaultSettings) {
            // @ts-ignore
            await Setting.findOrCreate({
                where: { key: setting.key },
                defaults: setting
            });
        }

        console.log('Settings seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding settings:', error);
        process.exit(1);
    }
};

seedSettings();
