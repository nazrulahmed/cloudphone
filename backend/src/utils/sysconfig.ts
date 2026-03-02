import axios from 'axios';

class SysconfigAPI {
    private baseUrl: string;
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null = null;
    private tokenExpiry: number | null = null;

    constructor() {
        this.baseUrl = process.env.SYSCONFIG_BASE_URL || 'https://sysconfig.co.uk/app/api_gateway/v1';
        this.clientId = process.env.SYSCONFIG_CLIENT_ID || '';
        this.clientSecret = process.env.SYSCONFIG_CLIENT_SECRET || '';
    }

    private async authenticate() {
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return;
        }

        try {
            const response = await axios.post(`${this.baseUrl}/oauth/token`, new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: this.clientId,
                client_secret: this.clientSecret
            }));

            this.accessToken = response.data.access_token;
            // Expires in is in seconds, convert to absolute ms with a 5min buffer
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 300000;
        } catch (error: any) {
            console.error('Sysconfig Authentication failed:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with Sysconfig');
        }
    }

    async getAvailableCliNumbers() {
        await this.authenticate();
        try {
            const response = await axios.get(`${this.baseUrl}/extensions/available-cli`, {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch available CLI numbers:', error.response?.data || error.message);
            throw error;
        }
    }

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
}

export const sysconfig = new SysconfigAPI();
