import axios from 'axios';

class SysconfigAPI {
    private baseUrl: string;
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null = null;
    private tokenExpiry: number | null = null;

    constructor() {
        this.baseUrl = 'https://sysconfig.co.uk/app/api_gateway/v1';
        this.clientId = '';
        this.clientSecret = '';
    }

    private async authenticate() {
        // Refresh credentials from env
        this.baseUrl = process.env.SYSCONFIG_BASE_URL || 'https://sysconfig.co.uk/app/api_gateway/v1';
        this.clientId = process.env.SYSCONFIG_CLIENT_ID || '';
        this.clientSecret = process.env.SYSCONFIG_CLIENT_SECRET || '';

        if (!this.clientId || this.clientId === 'provide_your_client_id_here') {
            throw new Error('Sysconfig Client ID not configured');
        }
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return;
        }

        try {
            console.log('Authenticating with Sysconfig...', { baseUrl: this.baseUrl, clientId: this.clientId });
            const response = await axios.post(`${this.baseUrl}/oauth/token`, new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: this.clientId,
                client_secret: this.clientSecret
            }));

            console.log('Sysconfig Authentication successful');
            this.accessToken = response.data.access_token;
            // Expires in is in seconds, convert to absolute ms with a 5min buffer
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 300000;
        } catch (error: any) {
            console.error('Sysconfig Authentication failed:', error.response?.status, error.response?.data || error.message);
            throw new Error(`Failed to authenticate with Sysconfig: ${error.response?.status || 'Unknown error'}`);
        }
    }

    async getAvailableCliNumbers() {
        await this.authenticate();
        try {
            console.log('Fetching available CLI numbers from Sysconfig...');
            const response = await axios.get(`${this.baseUrl}/extensions/available-cli`, {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            console.log('Successfully fetched numbers from Sysconfig');
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch available CLI numbers:', error.response?.status, error.response?.data || error.message);
            throw error;
        }
    }

    async getAvailableExtensions() {
        await this.authenticate();
        try {
            console.log('Fetching available extensions from Sysconfig...');
            const response = await axios.get(`${this.baseUrl}/extensions/available`, {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch available extensions:', error.response?.status, error.response?.data || error.message);
            throw error;
        }
    }


    /**
     * Create a new extension (can be an Agent, IVR, or Queue based on type)
     */
    async createExtension(data: any) {
        await this.authenticate();
        try {
            const response = await axios.post(`${this.baseUrl}/extensions`, data, {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to create extension:', error.response?.data || error.message);
            throw error;
        }
    }

    async getExtensions() {
        await this.authenticate();
        try {
            const response = await axios.get(`${this.baseUrl}/extensions`, {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch extensions:', error.response?.data || error.message);
            throw error;
        }
    }

    async updateExtension(uuid: string, data: any) {
        await this.authenticate();
        try {
            const response = await axios.put(`${this.baseUrl}/extensions/${uuid}`, data, {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to update extension:', error.response?.data || error.message);
            throw error;
        }
    }

    // Speculative Call Flow endpoints
    async getIvrs() {
        await this.authenticate();
        try {
            const response = await axios.get(`${this.baseUrl}/ivrs`, {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch IVRs:', error.response?.status);
            return { data: [] }; // Fallback
        }
    }

    async getQueues() {
        await this.authenticate();
        try {
            const response = await axios.get(`${this.baseUrl}/queues`, {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch Queues:', error.response?.status);
            return { data: [] }; // Fallback
        }
    }

    async getRingGroups() {
        await this.authenticate();
        try {
            const response = await axios.get(`${this.baseUrl}/ring-groups`, {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch Ring Groups:', error.response?.status);
            return { data: [] }; // Fallback
        }
    }

    async getExtension(uuid: string) {
        await this.authenticate();
        try {
            const response = await axios.get(`${this.baseUrl}/extensions/${uuid}`, {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch extension details:', error.response?.status);
            throw error;
        }
    }
}

export const sysconfig = new SysconfigAPI();
