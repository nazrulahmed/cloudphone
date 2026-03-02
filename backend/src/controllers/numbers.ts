import { sysconfig } from '../utils/sysconfig.js';

export const getAvailableNumbers = async (req: any, res: any) => {
    const { country } = req.query;

    try {
        // Ensure credentials are provided
        if (!process.env.SYSCONFIG_CLIENT_ID || process.env.SYSCONFIG_CLIENT_ID === 'provide_your_client_id_here') {
            return res.status(401).json({ error: 'Sysconfig API credentials not configured. Please add them to backend/.env' });
        }

        // Fetch live CLI numbers from Sysconfig
        const sysconfigData = await sysconfig.getAvailableCliNumbers();

        // Map Sysconfig's available_cli_numbers to our standard format
        const numbers = (sysconfigData.available_cli_numbers || []).map((item: any) => ({
            number: item.number,
            location: item.location || 'United Kingdom',
            country: 'UK',
            id: item.numberrange_detail_uuid
        }));

        res.json({ data: numbers });
    } catch (error: any) {
        console.error('Error fetching numbers from Sysconfig:', error.message);
        res.status(500).json({ error: 'Failed to fetch available numbers from Sysconfig' });
    }
};


export const purchaseNumber = async (req: any, res: any) => {
    const { number, id } = req.body; // 'id' corresponds to numberrange_detail_uuid

    try {
        // In Sysconfig, we create an extension and assign the number
        // For now, we'll log the purchase. Real implementation depends on the tenant's context.
        console.log(`Purchasing number: ${number} (UUID: ${id})...`);

        res.json({ success: true, message: 'Number selection captured' });
    } catch (error) {
        console.error('Error purchasing number:', error);
        res.status(500).json({ error: 'Failed to purchase number' });
    }
};

