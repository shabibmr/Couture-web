import CustomerAddress from './models/customer_address.model.js';

export const getAddresses = async (req, res) => {
    try {
        const addresses = await CustomerAddress.findAll({
            where: { customer_id: req.user.id },
            order: [['created_at', 'DESC']],
        });
        res.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createAddress = async (req, res) => {
    try {
        const { is_default_shipping, is_default_billing } = req.body;

        if (is_default_shipping) {
            await CustomerAddress.update(
                { is_default_shipping: false },
                { where: { customer_id: req.user.id } }
            );
        }

        if (is_default_billing) {
            await CustomerAddress.update(
                { is_default_billing: false },
                { where: { customer_id: req.user.id } }
            );
        }

        const address = await CustomerAddress.create({
            ...req.body,
            customer_id: req.user.id,
        });

        res.status(201).json(address);
    } catch (error) {
        console.error('Error creating address:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_default_shipping, is_default_billing } = req.body;

        const address = await CustomerAddress.findOne({
            where: { id, customer_id: req.user.id },
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        if (is_default_shipping) {
            await CustomerAddress.update(
                { is_default_shipping: false },
                { where: { customer_id: req.user.id } }
            );
        }

        if (is_default_billing) {
            await CustomerAddress.update(
                { is_default_billing: false },
                { where: { customer_id: req.user.id } }
            );
        }

        await address.update(req.body);
        res.json(address);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await CustomerAddress.destroy({
            where: { id, customer_id: req.user.id },
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
