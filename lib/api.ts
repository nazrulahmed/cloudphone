// API utility functions for Sysconfig integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface PhoneNumber {
  number: string;
  location: string;
  country?: string;
  area?: string;
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
      headers: {
        'Content-Type': 'application/json',
        // Add authentication header if needed
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<PhoneNumber[]> = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    return result.data || [];
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    throw error;
  }
}

/**
 * Purchase/select a phone number via Sysconfig API
 */
export async function purchaseNumber(number: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/numbers/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication header if needed
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ number }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<{ success: boolean }> = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    return { success: true, message: result.message };
  } catch (error) {
    console.error('Error purchasing phone number:', error);
    throw error;
  }
}

