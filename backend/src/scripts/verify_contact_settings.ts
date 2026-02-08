import sequelize from '../config/database';
import Setting from '../modules/system/settings.model.js';

const verifySettings = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const settings = await Setting.findAll();
        const settingsMap: Record<string, string> = {};
        settings.forEach((s: any) => {
            settingsMap[s.key] = s.value;
        });

        const keysToCheck = [
            'contact_email',
            'contact_phone',
            'contact_whatsapp',
            'contact_address',
            'social_instagram',
            'social_facebook',
            'social_twitter'
        ];

        let allFound = true;
        keysToCheck.forEach(key => {
            if (settingsMap[key]) {
                console.log(`✅ ${key}: ${settingsMap[key]}`);
            } else {
                console.log(`❌ ${key}: NOT FOUND`);
                allFound = false;
            }
        });

        if (allFound) {
            console.log('All contact settings verification PASSED.');
            process.exit(0);
        } else {
            console.log('Some settings are missing.');
            process.exit(1);
        }

    } catch (error) {
        console.error('Error verifying settings:', error);
        process.exit(1);
    }
};

verifySettings();
