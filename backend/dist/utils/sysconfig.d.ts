declare class SysconfigAPI {
    private baseUrl;
    private clientId;
    private clientSecret;
    private accessToken;
    private tokenExpiry;
    constructor();
    private authenticate;
    getAvailableCliNumbers(): Promise<any>;
    getAvailableExtensions(): Promise<any>;
    /**
     * Create a new extension (can be an Agent, IVR, or Queue based on type)
     */
    createExtension(data: any): Promise<any>;
    getExtensions(): Promise<any>;
    updateExtension(uuid: string, data: any): Promise<any>;
    getIvrs(): Promise<any>;
    getQueues(): Promise<any>;
    getRingGroups(): Promise<any>;
    getExtension(uuid: string): Promise<any>;
}
export declare const sysconfig: SysconfigAPI;
export {};
//# sourceMappingURL=sysconfig.d.ts.map