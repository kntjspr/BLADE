import type { VercelRequest, VercelResponse } from '@vercel/node';

interface IPQSResponse {
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

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        // Get IP from query parameter
        const { ip } = req.query;

        if (!ip || typeof ip !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'IP address is required'
            });
        }

        // Validate IP format (basic validation)
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(ip)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid IP address format'
            });
        }

        // Get API key from environment variable
        const apiKey = process.env.IPQS_API_KEY;

        if (!apiKey) {
            console.error('IPQS_API_KEY environment variable is not set');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }

        // Call IPQS API
        const ipqsUrl = `https://ipqualityscore.com/api/json/ip/${apiKey}/${ip}?strictness=1&allow_public_access_points=true`;

        const response = await fetch(ipqsUrl);

        if (!response.ok) {
            throw new Error(`IPQS API returned status ${response.status}`);
        }

        const data: IPQSResponse = await response.json();

        // Return the IPQS response
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error fetching IPQS data:', error);

        return res.status(500).json({
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
        });
    }
}
