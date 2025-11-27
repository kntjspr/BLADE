// IPQS API Wrapper
// This is a simple Node.js/Express server that proxies IPQS requests
// Deploy this to your backend server

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;
const IPQS_API_KEY = process.env.IPQS_API_KEY || 'ZTTwQmjMECTYwZ4YHHEm42iH4tbl7UQZ';

app.use(cors());
app.use(express.json());

// IPQS proxy endpoint
app.get('/api/ipqs/:ip', async (req, res) => {
    try {
        const { ip } = req.params;
        const url = `https://ipqualityscore.com/api/json/ip/${IPQS_API_KEY}/${ip}?strictness=1&allow_public_access_points=true`;

        const response = await fetch(url);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error('IPQS API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch IPQS data'
        });
    }
});

app.listen(PORT, () => {
    console.log(`IPQS API Wrapper running on port ${PORT}`);
});

export default app;
