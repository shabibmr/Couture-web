import Setting from '../system/settings.model.js';

/**
 * Calculate shipping cost based on subtotal and settings
 * GET /api/orders/shipping/calculate?subtotal=1000
 */
export const calculateShipping = async (req, res) => {
    try {
        const { subtotal } = req.query;

        if (!subtotal || isNaN(parseFloat(subtotal))) {
            return res.status(400).json({ message: 'Valid subtotal required' });
        }

        const subtotalAmount = parseFloat(subtotal);

        // Fetch settings from database
        const settingsData = await Setting.findAll();
        const settings = {};
        settingsData.forEach(s => { settings[s.key] = s.value; });

        const baseShippingFee = settings.shipping_fee !== undefined && settings.shipping_fee !== null
            ? parseFloat(settings.shipping_fee)
            : 0.00;
        const freeShippingThreshold = settings.free_shipping_threshold !== undefined && settings.free_shipping_threshold !== null
            ? parseFloat(settings.free_shipping_threshold)
            : 0;

        // Calculate shipping - free if subtotal exceeds threshold
        const shipping_amount = (subtotalAmount >= freeShippingThreshold && freeShippingThreshold > 0)
            ? 0
            : baseShippingFee;

        res.json({
            shipping_amount,
            is_free: shipping_amount === 0,
            free_shipping_threshold: freeShippingThreshold,
            amount_to_free_shipping: shipping_amount > 0 && freeShippingThreshold > 0
                ? Math.max(0, freeShippingThreshold - subtotalAmount)
                : 0
        });
    } catch (error) {
        console.error('Error calculating shipping:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
