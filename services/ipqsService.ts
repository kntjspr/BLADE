// IPQS API service using Vercel serverless function
// The API key is securely stored on the backend and never exposed to the client
// The IP address is detected server-side and cannot be manipulated by the client

import { IPQSResult } from '../types';

// Re-export for backward compatibility
export type { IPQSResult } from '../types';

/**
 * Get IP quality score from IPQS API via our secure backend endpoint
 * The server automatically detects the client's IP address from request headers
 * This prevents clients from manipulating the IP parameter to abuse the API
 * 
 * @deprecated The ip parameter is no longer used - server detects IP automatically
 */
export async function getIPQualityScore(_ip?: string): Promise<IPQSResult> {
    try {
        // Call our Vercel serverless function
        // This works both locally (vercel dev) and in production
        // No IP parameter needed - server detects it from request headers
        const url = `/api/ipqs`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data as IPQSResult;
    } catch (error) {
        console.error('Error fetching IPQS data:', error);
        // Return a default error response
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch IPQS data',
            fraud_score: 0,
            country_code: '',
            region: '',
            city: '',
            ISP: '',
            ASN: 0,
            organization: '',
            is_crawler: false,
            timezone: '',
            mobile: false,
            host: '',
            proxy: false,
            vpn: false,
            tor: false,
            active_vpn: false,
            active_tor: false,
            recent_abuse: false,
            bot_status: false,
            connection_type: '',
            abuse_velocity: '',
            zip_code: '',
            latitude: 0,
            longitude: 0,
            request_id: ''
        };
    }
}
