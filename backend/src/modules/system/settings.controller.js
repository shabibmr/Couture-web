import Setting from './settings.model.js';

export const getSettings = async (req, res) => {
    try {
        const settings = await Setting.findAll();

        // Convert to key-value object
        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value;
        });

        res.json(settingsObj);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const updates = req.body; // Expected: { key: value, key2: value2, ... }

        const promises = Object.entries(updates).map(([key, value]) => {
            return Setting.upsert({
                key,
                value: String(value),
            });
        });

        await Promise.all(promises);

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
