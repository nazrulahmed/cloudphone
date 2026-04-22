import { query } from '../config/db.js';

export const sysconfigWebhookHandler = async (req: any, res: any) => {
    try {
        const payload = req.body;
        console.log('Received Sysconfig Webhook from PBX:', JSON.stringify(payload, null, 2));

        // Attempt to find the tenant based on the CLI number in the webhook payload
        const cliNumber = payload.number_cli || payload.cdr_cli || payload.extension;

        let tenantId = 1; // Default fallback for untracked system events

        if (cliNumber) {
            const result = await query(
                'SELECT tenant_id FROM purchased_numbers WHERE number = $1 LIMIT 1',
                [cliNumber]
            );

            if (result.rows.length > 0) {
                tenantId = result.rows[0].tenant_id;
            } else {
                // Secondary check: is it an internal extension?
                const extResult = await query(
                    'SELECT tenant_id FROM extensions WHERE extension = $1 LIMIT 1',
                    [cliNumber]
                );
                if (extResult.rows.length > 0) {
                    tenantId = extResult.rows[0].tenant_id;
                }
            }
        }

        // Insert the raw payload with the identified tenant_id
        await query(
            'INSERT INTO cdrs (tenant_id, payload) VALUES ($1, $2)',
            [tenantId, JSON.stringify(payload)]
        );

        res.status(200).json({ success: true, message: 'Webhook received and logged' });

    } catch (error: any) {
        console.error('Error processing Sysconfig webhook:', error.message);
        res.status(500).json({ error: 'Internal Server Error processing webhook' });
    }
};

export const getCdrs = async (req: any, res: any) => {
    const tenantId = req.user.tenantId;

    try {
        const result = await query(
            'SELECT * FROM cdrs WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 100',
            [tenantId]
        );

        res.json({ success: true, data: result.rows });
    } catch (error: any) {
        console.error('Error fetching CDRs:', error.message);
        res.status(500).json({ error: 'Internal Server Error fetching CDRs' });
    }
};
