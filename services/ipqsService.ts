// IPQS API service using Vercel serverless function
// The API key is securely stored on the backend and never exposed to the client

export interface IPQSResult {
    success: boolean;
    message: string;
    fraud_score: number;
    country_code: string;
    region: string;
    city: string;
    ISP: string;
    ASN: number;
    organization: string;
    is_crawler: boolean;
    timezone: string;
    mobile: boolean;
    host: string;
    proxy: boolean;
    vpn: boolean;
    tor: boolean;
    active_vpn: boolean;
    active_tor: boolean;
    recent_abuse: boolean;
    bot_status: boolean;
    connection_type: string;
    abuse_velocity: string;
    zip_code: string;
    latitude: number;
    longitude: number;
    request_id: string;
}

/**
 * Get IP quality score from IPQS API via our secure backend endpoint
 * This prevents exposing the API key to the client
 */
export async function getIPQualityScore(ip: string): Promise<IPQSResult> {
    try {
        // Call our Vercel serverless function
        // This works both locally (vercel dev) and in production
        const url = `/api/ipqs?ip=${encodeURIComponent(ip)}`;

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

