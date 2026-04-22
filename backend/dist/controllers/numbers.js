import { sysconfig } from '../utils/sysconfig.js';
import { query } from '../config/db.js';
export const getAvailableNumbers = async (req, res) => {
    const { country } = req.query;
    try {
        // Ensure credentials are provided
        if (!process.env.SYSCONFIG_CLIENT_ID || process.env.SYSCONFIG_CLIENT_ID === 'provide_your_client_id_here') {
            return res.status(401).json({ error: 'Sysconfig API credentials not configured. Please add them to backend/.env' });
        }
        // Fetch live CLI numbers from Sysconfig
        const sysconfigData = await sysconfig.getAvailableCliNumbers();
        // Map Sysconfig's available_cli_numbers to our standard format
        const numbers = (sysconfigData.available_cli_numbers || []).map((item) => ({
            number: item.number,
            location: item.location || 'United Kingdom',
            country: 'UK',
            id: item.numberrange_detail_uuid
        }));
        res.json({ data: numbers });
    }
    catch (error) {
        console.error('Error fetching numbers from Sysconfig:', error.message);
        res.status(500).json({ error: 'Failed to fetch available numbers from Sysconfig' });
    }
};
export const purchaseNumber = async (req, res) => {
    const { number, id } = req.body;
    try {
        console.log(`Purchasing number ${number} (ID: ${id})...`);
        // In a real implementation, this would call Sysconfig's API.
        // For our demo, we simply acknowledge the "purchase" to move it into our active inventory.
        res.json({ success: true, message: 'Number purchased successfully' });
    }
    catch (error) {
        console.error('Error purchasing number:', error.message);
        res.status(500).json({ error: 'Failed to purchase number' });
    }
};
export const getExtensions = async (req, res) => {
    try {
        const sysconfigData = await sysconfig.getExtensions();
        res.json({ data: sysconfigData.data || [] });
    }
    catch (error) {
        console.error('Error fetching extensions from Sysconfig:', error.message);
        res.status(500).json({ error: 'Failed to fetch extensions from Sysconfig' });
    }
};
export const assignNumber = async (req, res) => {
    const { number, extensionUuid } = req.body;
    try {
        console.log(`Assigning number ${number} to destination ${extensionUuid}...`);
        // Handle virtual flows (created on the fly in the frontend/storage)
        if (extensionUuid.startsWith('flow-')) {
            console.log(`[VIRTUAL ROUTING] Number ${number} mapped to Virtual Flow ${extensionUuid}`);
            // In a real production system, this would trigger a background task to 
            // provision the flow in Sysconfig first. For the demo, we accept it.
            return res.json({
                success: true,
                virtual: true,
                message: 'Number assigned to virtual flow. Finalize the flow configuration to go live.'
            });
        }
        // Update the real extension in Sysconfig
        const result = await sysconfig.updateExtension(extensionUuid, {
            numberrange_detail_number_cli: number,
            numberrange_detail_number_billing: number
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Error assigning number:', error.message);
        res.status(500).json({ error: 'Failed to assign number' });
    }
};
export const createCallFlow = async (req, res) => {
    const { name, type, config } = req.body;
    // Hardcoded tenant for now as auth is not fully wired
    const tenantId = 1;
    try {
        console.log(`Creating Call Flow locally: ${name} (${type})...`);
        // We persist the flow in our local database first.
        // It will be provisioned in Sysconfig as an extension ONLY when a real CLI number 
        // is assigned to it, satisfying Sysconfig's strict numberrange constraints.
        const sysconfigUuid = null;
        // Persist in local database
        const result = await query('INSERT INTO call_flows (tenant_id, name, type, config, sysconfig_extension_uuid) VALUES ($1, $2, $3, $4, $5) RETURNING *', [tenantId, name, type, JSON.stringify(config), sysconfigUuid]);
        console.log('Successfully created Call Flow metadata in DB');
        res.status(201).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error('Error creating call flow:', error.message);
        res.status(500).json({ error: 'Failed to create call flow', details: error.message });
    }
};
export const getCallFlows = async (req, res) => {
    // Hardcoded tenant for now
    const tenantId = 1;
    try {
        console.log('Fetching call flows from database...');
        const result = await query('SELECT * FROM call_flows WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
        res.json({ data: result.rows });
    }
    catch (error) {
        console.error('Error fetching call flows:', error.message);
        res.status(500).json({ error: 'Failed to fetch call flows' });
    }
};
export const getExtensionDetails = async (req, res) => {
    const { uuid } = req.params;
    try {
        const data = await sysconfig.getExtension(uuid);
        res.json({ data });
    }
    catch (error) {
        console.error('Error fetching extension details:', error.message);
        res.status(500).json({ error: 'Failed to fetch extension details' });
    }
};
export const updateExtensionConfig = async (req, res) => {
    const { uuid } = req.params;
    const config = req.body;
    try {
        console.log(`Updating configuration for extension ${uuid}...`);
        const result = await sysconfig.updateExtension(uuid, config);
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Error updating extension:', error.message);
        res.status(500).json({ error: 'Failed to update extension' });
    }
};
export const updateCallFlow = async (req, res) => {
    const { uuid } = req.params;
    const { name, type, config } = req.body;
    const tenantId = 1;
    try {
        console.log(`Updating Call Flow ${uuid}...`);
        const result = await query('UPDATE call_flows SET name = $1, type = $2, config = $3, updated_at = CURRENT_TIMESTAMP WHERE uuid = $4 AND tenant_id = $5 RETURNING *', [name, type, JSON.stringify(config), uuid, tenantId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Call flow not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error('Error updating call flow:', error.message);
        res.status(500).json({ error: 'Failed to update call flow' });
    }
};
export const deleteCallFlow = async (req, res) => {
    const { uuid } = req.params;
    const tenantId = 1;
    try {
        console.log(`Deleting Call Flow ${uuid}...`);
        const result = await query('DELETE FROM call_flows WHERE uuid = $1 AND tenant_id = $2 RETURNING *', [uuid, tenantId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Call flow not found' });
        }
        res.json({ success: true, message: 'Call flow deleted' });
    }
    catch (error) {
        console.error('Error deleting call flow:', error.message);
        res.status(500).json({ error: 'Failed to delete call flow' });
    }
};
export const getSipCredentials = async (req, res) => {
    try {
        console.log('Fetching demo SIP credentials...');
        // For this demo context, we fetch all extensions and grab the first one
        // that belongs to our pool (ignoring virtual flows).
        // In production, this would look up the assigned extension for the currently authenticated user.
        const sysconfigData = await sysconfig.getExtensions();
        const extensions = sysconfigData.data || [];
        const validExt = extensions.find((e) => !e.extension_uuid.startsWith('flow-'));
        if (!validExt) {
            return res.status(404).json({ error: 'No valid SIP extensions found in the system.' });
        }
        // We specifically retrieve this extension's details to ensure we have the password field
        const extDetails = await sysconfig.getExtension(validExt.extension_uuid);
        if (!extDetails || !extDetails.password) {
            return res.status(500).json({ error: 'Failed to retrieve SIP password for the extension.' });
        }
        res.json({
            success: true,
            data: {
                username: extDetails.extension, // e.g "400" or "803"
                password: extDetails.password, // The SIP secret
                wssServer: 'wss://ordere.pbxtrunk.sysconfig.co.uk:7443', // Defaulting to secure websocket port
                domain: 'ordere.pbxtrunk.sysconfig.co.uk'
            }
        });
    }
    catch (error) {
        console.error('Error fetching SIP credentials:', error.message);
        res.status(500).json({ error: 'Failed to setup SIP credentials' });
    }
};
//# sourceMappingURL=numbers.js.map