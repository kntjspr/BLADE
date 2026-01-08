import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { IPQSResult } from '../types';

/**
 * Extract the real client IP address from request headers
 * Vercel provides the client IP in various headers depending on the proxy setup
 */
function getClientIP(req: VercelRequest): string | null {
    // Try to get IP from various headers (in order of preference)
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const vercelIP = req.headers['x-vercel-forwarded-for'];

    // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2, ...)
    // The first one is the original client IP
    if (forwarded) {
        const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
        const firstIP = ips.split(',')[0].trim();
        if (firstIP) return firstIP;
    }

    // x-real-ip contains the direct client IP
    if (realIP) {
        return Array.isArray(realIP) ? realIP[0] : realIP;
    }

    // Vercel-specific header
    if (vercelIP) {
        return Array.isArray(vercelIP) ? vercelIP[0] : vercelIP;
    }

    // Fallback to connection remote address (rarely used in serverless)
    return null;
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
        // Extract the real client IP from request headers
        // This CANNOT be manipulated by the client
        const clientIP = getClientIP(req);

        if (!clientIP) {
            console.error('Unable to determine client IP address');
            return res.status(400).json({
                success: false,
                message: 'Unable to determine client IP address'
            });
        }

        // Validate IP format (basic validation)
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(clientIP)) {
            console.error('Invalid IP format detected:', clientIP);
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

        // Call IPQS API with the server-detected client IP
        const ipqsUrl = `https://ipqualityscore.com/api/json/ip/${apiKey}/${clientIP}?strictness=1&allow_public_access_points=true`;

        const response = await fetch(ipqsUrl);

        if (!response.ok) {
            throw new Error(`IPQS API returned status ${response.status}`);
        }

        const data: IPQSResult = await response.json();

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

