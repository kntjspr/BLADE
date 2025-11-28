import { Session, SessionMatch } from '../types';

const API_BASE = '/api/sessions';

/**
 * Fetch all sessions from the database
 */
export async function loadSessions(): Promise<Session[]> {
    try {
        const response = await fetch(API_BASE);
        const data = await response.json();

        if (!data.success) {
            console.error('Failed to load sessions:', data.message);
            return [];
        }

        return data.sessions || [];
    } catch (error) {
        console.error('Error loading sessions:', error);
        return [];
    }
}

/**
 * Find a matching session based on fingerprints
 */
export function findMatchingSession(
    canvasFingerprint: string,
    webglFingerprint: string,
    sessions: Session[]
): SessionMatch | null {
    // Look for exact match (both canvas and WebGL match)
    const exactMatch = sessions.find(
        s => s.canvasFingerprint === canvasFingerprint &&
            s.webglFingerprint === webglFingerprint
    );

    if (exactMatch) {
        return {
            session: exactMatch,
            matchType: 'exact',
            confidence: 100
        };
    }

    // Look for partial match (either canvas or WebGL matches)
    const partialMatch = sessions.find(
        s => s.canvasFingerprint === canvasFingerprint ||
            s.webglFingerprint === webglFingerprint
    );

    if (partialMatch) {
        const canvasMatch = partialMatch.canvasFingerprint === canvasFingerprint;
        const webglMatch = partialMatch.webglFingerprint === webglFingerprint;

        return {
            session: partialMatch,
            matchType: 'partial',
            confidence: canvasMatch && webglMatch ? 100 : 50
        };
    }

    return null;
}

/**
 * Create a new session in the database
 */
export async function createSession(
    label: string,
    canvasFingerprint: string,
    webglFingerprint: string,
    notes?: string
): Promise<Session | null> {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                label,
                canvasFingerprint,
                webglFingerprint,
                notes
            })
        });

        const data = await response.json();

        if (!data.success) {
            console.error('Failed to create session:', data.message);
            return null;
        }

        return data.session;
    } catch (error) {
        console.error('Error creating session:', error);
        return null;
    }
}

/**
 * Update session last seen timestamp and increment visit count
 */
export async function updateSessionVisit(sessionId: string): Promise<Session | null> {
    try {
        const response = await fetch(API_BASE, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: sessionId })
        });

        const data = await response.json();

        if (!data.success) {
            console.error('Failed to update session:', data.message);
            return null;
        }

        return data.session;
    } catch (error) {
        console.error('Error updating session:', error);
        return null;
    }
}

/**
 * Delete a session from the database
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}?id=${sessionId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!data.success) {
            console.error('Failed to delete session:', data.message);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting session:', error);
        return false;
    }
}

/**
 * Get a session by ID
 */
export async function getSessionById(sessionId: string): Promise<Session | null> {
    const sessions = await loadSessions();
    return sessions.find(s => s.id === sessionId) || null;
}
