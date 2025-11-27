// IPQS API service using local wrapper API
// Make sure to run the wrapper API server (see api/ipqs-wrapper.ts)

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

// Use local wrapper API or fallback to CORS proxy for development
const USE_LOCAL_API = false; // Set to true when running the wrapper API
const LOCAL_API_URL = 'http://localhost:3001/api/ipqs';
const CORS_PROXY = 'https://corsproxy.io/?';
const IPQS_API_KEY = 'ZTTwQmjMECTYwZ4YHHEm42iH4tbl7UQZ';

/**
 * Get IP quality score from IPQS API
 */
export async function getIPQualityScore(ip: string): Promise<IPQSResult> {
    try {
        let url: string;

        if (USE_LOCAL_API) {
            // Use local wrapper API
            url = `${LOCAL_API_URL}/${ip}`;
        } else {
            // Fallback to CORS proxy for development
            const apiUrl = `https://ipqualityscore.com/api/json/ip/${IPQS_API_KEY}/${ip}?strictness=1&allow_public_access_points=true`;
            url = CORS_PROXY + encodeURIComponent(apiUrl);
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`IPQS API error: ${response.status}`);
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
