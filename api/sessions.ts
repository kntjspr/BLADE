import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './db.js';

interface Session {
    id: string;
    label: string;
    canvas_fingerprint: string;
    webgl_fingerprint: string;
    created_at: number;
    last_seen: number;
    visit_count: number;
    notes?: string;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Initialize database table if it doesn't exist
 */
async function initializeDatabase() {
    const sql = getDb();

    await sql`
        CREATE TABLE IF NOT EXISTS sessions (
            id VARCHAR(255) PRIMARY KEY,
            label VARCHAR(255) NOT NULL,
            canvas_fingerprint TEXT NOT NULL,
            webgl_fingerprint TEXT NOT NULL,
            created_at BIGINT NOT NULL,
            last_seen BIGINT NOT NULL,
            visit_count INTEGER DEFAULT 1,
            notes TEXT
        )
    `;

    // Create indexes if they don't exist
    await sql`CREATE INDEX IF NOT EXISTS idx_canvas_fingerprint ON sessions(canvas_fingerprint)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_webgl_fingerprint ON sessions(webgl_fingerprint)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_last_seen ON sessions(last_seen DESC)`;
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    try {
        // Initialize database on first request
        await initializeDatabase();

        const sql = getDb();
        const { method } = req;

        // GET /api/sessions - Fetch all sessions
        if (method === 'GET') {
            const sessions = await sql`
                SELECT * FROM sessions 
                ORDER BY last_seen DESC
            `;

            return res.status(200).json({
                success: true,
                sessions: sessions.map(s => ({
                    id: s.id,
                    label: s.label,
                    canvasFingerprint: s.canvas_fingerprint,
                    webglFingerprint: s.webgl_fingerprint,
                    createdAt: Number(s.created_at),
                    lastSeen: Number(s.last_seen),
                    visitCount: s.visit_count,
                    notes: s.notes
                }))
            });
        }

        // POST /api/sessions - Create new session
        if (method === 'POST') {
            const { label, canvasFingerprint, webglFingerprint, notes } = req.body;

            if (!label || !canvasFingerprint || !webglFingerprint) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: label, canvasFingerprint, webglFingerprint'
                });
            }

            const sessionId = generateSessionId();
            const now = Date.now();

            await sql`
                INSERT INTO sessions (
                    id, label, canvas_fingerprint, webgl_fingerprint, 
                    created_at, last_seen, visit_count, notes
                ) VALUES (
                    ${sessionId}, ${label}, ${canvasFingerprint}, ${webglFingerprint},
                    ${now}, ${now}, 1, ${notes || null}
                )
            `;

            return res.status(201).json({
                success: true,
                session: {
                    id: sessionId,
                    label,
                    canvasFingerprint,
                    webglFingerprint,
                    createdAt: now,
                    lastSeen: now,
                    visitCount: 1,
                    notes
                }
            });
        }

        // PUT /api/sessions - Update session visit
        if (method === 'PUT') {
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required field: id'
                });
            }

            const now = Date.now();

            const result = await sql`
                UPDATE sessions 
                SET last_seen = ${now}, visit_count = visit_count + 1
                WHERE id = ${id}
                RETURNING *
            `;

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
            }

            const session = result[0];

            return res.status(200).json({
                success: true,
                session: {
                    id: session.id,
                    label: session.label,
                    canvasFingerprint: session.canvas_fingerprint,
                    webglFingerprint: session.webgl_fingerprint,
                    createdAt: Number(session.created_at),
                    lastSeen: Number(session.last_seen),
                    visitCount: session.visit_count,
                    notes: session.notes
                }
            });
        }

        // DELETE /api/sessions - Delete session
        if (method === 'DELETE') {
            const { id } = req.query;

            if (!id || typeof id !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required query parameter: id'
                });
            }

            const result = await sql`
                DELETE FROM sessions 
                WHERE id = ${id}
                RETURNING id
            `;

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Session deleted successfully'
            });
        }

        // Method not allowed
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });

    } catch (error) {
        console.error('Error in sessions API:', error);

        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
}
