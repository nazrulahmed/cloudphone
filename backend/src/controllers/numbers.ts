import { sysconfig } from '../utils/sysconfig.js';
import { query } from '../config/db.js';

export const getAvailableNumbers = async (req: any, res: any) => {
    try {
        if (!process.env.SYSCONFIG_CLIENT_ID || process.env.SYSCONFIG_CLIENT_ID === 'provide_your_client_id_here') {
            return res.status(401).json({ error: 'Sysconfig API credentials not configured.' });
        }

        // Fetch numbers from Sysconfig
        const sysconfigData = await sysconfig.getAvailableCliNumbers();
        const rawNumbers = (sysconfigData.available_cli_numbers || []);

        // Fetch already purchased numbers from our local DB
        const result = await query('SELECT number FROM purchased_numbers');
        const claimedNumbers = new Set(result.rows.map((r: any) => r.number));

        // Filter out claimed numbers
        const numbers = rawNumbers
            .filter((item: any) => !claimedNumbers.has(item.number))
            .map((item: any) => ({
                number: item.number,
                location: item.location || 'United Kingdom',
                country: 'UK',
                id: item.numberrange_detail_uuid
            }));

        res.json({ data: numbers });
    } catch (error: any) {
        console.error('Error fetching available numbers:', error.message);
        res.status(500).json({ error: 'Failed to fetch available numbers' });
    }
};

export const purchaseNumber = async (req: any, res: any) => {
    const { number, id } = req.body;
    const tenantId = req.user.tenantId;

    try {
        console.log(`[TENANT ${tenantId}] Purchasing number ${number}...`);

        // Insert into our local database to claim this number for the tenant
        await query(
            'INSERT INTO purchased_numbers (tenant_id, number, sysconfig_uuid) VALUES ($1, $2, $3)',
            [tenantId, number, id]
        );

        res.json({ success: true, message: 'Number added to your inventory' });
    } catch (error: any) {
        console.error('Error purchasing number:', error.message);
        res.status(500).json({ error: 'Failed to purchase number' });
    }
};

export const getInventory = async (req: any, res: any) => {
    const tenantId = req.user.tenantId;
    try {
        const result = await query(
            'SELECT * FROM purchased_numbers WHERE tenant_id = $1 ORDER BY created_at DESC',
            [tenantId]
        );
        res.json({ data: result.rows });
    } catch (error: any) {
        console.error('Error fetching inventory:', error.message);
        res.status(500).json({ error: 'Failed to fetch your numbers' });
    }
};

export const getExtensions = async (req: any, res: any) => {
    const tenantId = req.user.tenantId;
    try {
        // Fetch only extensions belonging to this tenant from our local DB
        const localExts = await query(
            'SELECT * FROM extensions WHERE tenant_id = $1 ORDER BY created_at DESC',
            [tenantId]
        );

        if (localExts.rows.length === 0) {
            return res.json({ data: [] });
        }

        // To get the latest status/details, we could cross-reference with Sysconfig
        // but for performance, we return our local list of their "Teams"
        res.json({
            data: localExts.rows.map(row => ({
                extension_uuid: row.sysconfig_uuid,
                extension: row.extension,
                type: row.type || 'Agent'
            }))
        });
    } catch (error: any) {
        console.error('Error fetching extensions:', error.message);
        res.status(500).json({ error: 'Failed to fetch extensions' });
    }
};

export const createTeam = async (req: any, res: any) => {
    const { name, extension } = req.body;
    const tenantId = req.user.tenantId;

    try {
        // 1. Get the tenant's number (Sysconfig requires a CLI for extensions)
        const numberResult = await query(
            'SELECT number, sysconfig_uuid FROM purchased_numbers WHERE tenant_id = $1 LIMIT 1',
            [tenantId]
        );

        if (numberResult.rows.length === 0) {
            return res.status(400).json({
                error: 'No phone number found for your account. Please purchase a number first before adding team members.'
            });
        }

        const { number: tenantNumber, sysconfig_uuid: tenantNumberUuid } = numberResult.rows[0];

        // 2. Create in Sysconfig
        const sysconfigExt = await sysconfig.createExtension({
            extension: extension,
            display_name: name,
            type: 'sip_user',
            numberrange_detail_uuid_cli: tenantNumberUuid, // Use UUID for reliable assignment
            numberrange_detail_number_cli: tenantNumber, // Also include number for reference
            numberrange_detail_uuid_billing: tenantNumberUuid, // Required by API
            numberrange_detail_number_billing: tenantNumber // Required by API
        });

        console.log('Sysconfig extension created:', sysconfigExt);

        const newExtUuid = sysconfigExt.extension_uuid || sysconfigExt.uuid;

        if (!newExtUuid) {
            console.error('Sysconfig response missing UUID:', sysconfigExt);
            throw new Error('Sysconfig failed to provide a unique identifier for the new extension.');
        }

        // 3. Link to our tenant locally
        await query(
            'INSERT INTO extensions (tenant_id, sysconfig_uuid, extension, type) VALUES ($1, $2, $3, $4)',
            [tenantId, newExtUuid, extension, 'Agent']
        );

        res.status(201).json({ success: true, data: { ...sysconfigExt, uuid: newExtUuid } });
    } catch (error: any) {
        console.error('Error creating team:', error.response?.data || error.message);
        const errDesc = error.response?.data?.error_description || error.message;
        res.status(500).json({ error: `Failed to create team: ${errDesc}` });
    }
};

export const assignNumber = async (req: any, res: any) => {
    const { number, extensionUuid } = req.body;
    const tenantId = req.user.tenantId;

    try {
        // Verify tenant owns the number
        const numCheck = await query('SELECT * FROM purchased_numbers WHERE number = $1 AND tenant_id = $2', [number, tenantId]);
        if (numCheck.rows.length === 0) {
            return res.status(403).json({ error: 'You do not own this number' });
        }

        if (extensionUuid.startsWith('flow-')) {
            return res.json({ success: true, virtual: true, message: 'Mapped to local flow.' });
        }

        await sysconfig.updateExtension(extensionUuid, {
            numberrange_detail_number_cli: number,
            numberrange_detail_number_billing: number
        });

        res.json({ success: true });
    } catch (error: any) {
        console.error('Error in assignNumber:', error.message);
        res.status(500).json({ error: 'Failed to assign number' });
    }
};

export const getCallFlows = async (req: any, res: any) => {
    const tenantId = req.user.tenantId;
    try {
        const result = await query('SELECT * FROM call_flows WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
        res.json({ data: result.rows });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch flows' });
    }
};

export const createCallFlow = async (req: any, res: any) => {
    const { name, type, config } = req.body;
    const tenantId = req.user.tenantId;
    try {
        const result = await query(
            'INSERT INTO call_flows (tenant_id, name, type, config) VALUES ($1, $2, $3, $4) RETURNING *',
            [tenantId, name, type, JSON.stringify(config)]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create flow' });
    }
};

export const getExtensionDetails = async (req: any, res: any) => {
    const { uuid } = req.params;
    const tenantId = req.user.tenantId;

    try {
        // Verify tenant owns the extension
        const extCheck = await query('SELECT * FROM extensions WHERE sysconfig_uuid = $1 AND tenant_id = $2', [uuid, tenantId]);
        if (extCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const data = await sysconfig.getExtension(uuid);
        res.json({ data });
    } catch (error) {
        console.error('Error fetching extension details:', error);
        res.status(500).json({ error: 'Failed to fetch details' });
    }
};

export const updateExtensionConfig = async (req: any, res: any) => {
    const { uuid } = req.params;
    const tenantId = req.user.tenantId;

    try {
        // Verify tenant owns the extension
        const extCheck = await query('SELECT * FROM extensions WHERE sysconfig_uuid = $1 AND tenant_id = $2', [uuid, tenantId]);
        if (extCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const result = await sysconfig.updateExtension(uuid, req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error updating extension:', error);
        res.status(500).json({ error: 'Failed to update' });
    }
};

export const updateCallFlow = async (req: any, res: any) => {
    const { uuid } = req.params;
    const { name, type, config } = req.body;
    const tenantId = req.user.tenantId;
    try {
        const result = await query(
            'UPDATE call_flows SET name = $1, type = $2, config = $3 WHERE uuid = $4 AND tenant_id = $5 RETURNING *',
            [name, type, JSON.stringify(config), uuid, tenantId]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error' });
    }
};

export const deleteCallFlow = async (req: any, res: any) => {
    const tenantId = req.user.tenantId;
    try {
        await query('DELETE FROM call_flows WHERE uuid = $1 AND tenant_id = $2', [req.params.uuid, tenantId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error' });
    }
};

export const getSipCredentials = async (req: any, res: any) => {
    const tenantId = req.user.tenantId;
    try {
        // Look up this tenant's extensions
        const result = await query('SELECT * FROM extensions WHERE tenant_id = $1 LIMIT 1', [tenantId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No extensions found for your account. Please create a team/agent first.' });
        }

        const ext = result.rows[0];
        const extDetails = await sysconfig.getExtension(ext.sysconfig_uuid);

        res.json({
            success: true,
            data: {
                username: extDetails.extension,
                password: extDetails.password,
                wssServer: 'wss://ordere.pbxtrunk.sysconfig.co.uk:7443',
                domain: 'ordere.pbxtrunk.sysconfig.co.uk'
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch credentials' });
    }
};

