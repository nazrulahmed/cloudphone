// API utility functions for Sysconfig integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Helper to get authentication headers
 */
function getHeaders(isFormData = false) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers: any = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface PhoneNumber {
  number: string;
  location: string;
  country?: string;
  area?: string;
  id?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Fetch available phone numbers from Sysconfig API
 */
export async function fetchAvailableNumbers(country?: string): Promise<PhoneNumber[]> {
  try {
    const url = country
      ? `${API_BASE_URL}/numbers/available?country=${country}`
      : `${API_BASE_URL}/numbers/available`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result: ApiResponse<PhoneNumber[]> = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    throw error;
  }
}

/**
 * Fetch tenant's purchased numbers from our backend
 */
export async function fetchInventory(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/numbers/inventory`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch inventory');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
}

/**
 * Purchase/select a phone number via Sysconfig API
 */
export async function purchaseNumber(number: string, id?: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/numbers/purchase`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ number, id }),
    });


    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result: ApiResponse<{ success: boolean }> = await response.json();
    return { success: true, message: result.message };
  } catch (error) {
    console.error('Error purchasing phone number:', error);
    throw error;
  }
}

/**
 * Fetch real extensions from Sysconfig
 */
export async function fetchExtensions(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/numbers/extensions`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch extensions');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching extensions:', error);
    return [];
  }
}

/**
 * Create a new Team (Agent Extension)
 */
export async function createTeam(name: string, extension: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/numbers/extensions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, extension }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to create team');
  }
  return result.data;
}

/**
 * Assign a number to an extension in real Sysconfig
 */
export async function assignNumber(number: string, extensionUuid: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/numbers/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ number, extensionUuid }),
    });
    if (!response.ok) throw new Error('Failed to assign number');
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error assigning number:', error);
    return false;
  }
}

/**
 * Fetch tenant call flows from DB
 */
export async function fetchRealCallFlows(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/numbers/call-flows`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch call flows');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching call flows:', error);
    return [];
  }
}

/**
 * Fetch detailed config for a specific extension
 */
export async function fetchExtensionDetails(uuid: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/numbers/extensions/${uuid}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch extension details');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching extension details:', error);
    return null;
  }
}

/**
 * Update extension configuration (Caller ID, Timeout, Voicemail)
 */
export async function updateExtensionConfig(uuid: string, config: any): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/numbers/extensions/${uuid}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(config),
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating extension config:', error);
    return false;
  }
}

/**
 * Create a new Call Flow (persisted in DB)
 */
export async function createCallFlow(name: string, type: string, config: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/numbers/call-flows`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, type, config }),
    });
    if (!response.ok) throw new Error('Failed to create call flow');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating call flow:', error);
    return null;
  }
}

/**
 * Update an existing Call Flow
 */
export async function updateCallFlow(uuid: string, name: string, type: string, config: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/numbers/call-flows/${uuid}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name, type, config }),
    });
    if (!response.ok) throw new Error('Failed to update call flow');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating call flow:', error);
    return null;
  }
}

/**
 * Delete a Call Flow
 */
export async function deleteCallFlow(uuid: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/numbers/call-flows/${uuid}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting call flow:', error);
    return false;
  }
}

/**
 * Fetch Call Detail Records (CDRs)
 */
export async function fetchCdrs(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/webhooks/cdrs`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch CDRs');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching CDRs:', error);
    return [];
  }
}

/**
 * Fetch KYC Documents
 */
export async function fetchKycDocuments(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/onboarding/kyc`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch KYC docs');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching KYC docs:', error);
    return [];
  }
}

/**
 * Upload KYC Document
 */
export async function uploadKycDocument(documentType: string, file: File): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('document', file);

    const response = await fetch(`${API_BASE_URL}/onboarding/kyc`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to upload document');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    return null;
  }
}
