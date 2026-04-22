import { query } from '../config/db.js';
export const sysconfigWebhookHandler = async (req, res) => {
    // Hardcoded tenant ID for demo purposes
    const tenantId = 1;
    try {
        const payload = req.body;
        console.log('Received Sysconfig Webhook from PBX:', JSON.stringify(payload, null, 2));
        // Insert the raw payload into the generic cdrs table
        await query('INSERT INTO cdrs (tenant_id, payload) VALUES ($1, $2)', [tenantId, JSON.stringify(payload)]);
        // Acknowledge receipt quickly to prevent Sysconfig from retrying
        res.status(200).json({ success: true, message: 'Webhook received and logged' });
    }
    catch (error) {
        console.error('Error processing Sysconfig webhook:', error.message);
        // Return 500 so Sysconfig knows there was an issue and might retry
        res.status(500).json({ error: 'Internal Server Error processing webhook' });
    }
};
export const getCdrs = async (req, res) => {
    // Hardcoded tenant ID for demo purposes
    const tenantId = 1;
    try {
        const result = await query('SELECT * FROM cdrs WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 100', [tenantId]);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error('Error fetching CDRs:', error.message);
        res.status(500).json({ error: 'Internal Server Error fetching CDRs' });
    }
};
//# sourceMappingURL=webhooks.js.map