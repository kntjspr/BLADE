import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Tag, Fingerprint } from 'lucide-react';
import { Session } from '../types';
import { loadSessions, deleteSession } from '../services/sessionStorage';
import { formatDate, truncateHash } from '../utils/formatting';

export const SessionManager: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);

    useEffect(() => {
        refreshSessions();
    }, []);

    const refreshSessions = () => {
        setSessions(loadSessions());
    };

    const handleDelete = (sessionId: string) => {
        if (confirm('Are you sure you want to delete this session?')) {
            deleteSession(sessionId);
            refreshSessions();
            if (selectedSession?.id === sessionId) {
                setSelectedSession(null);
            }
        }
    };

    const handleRefresh = async () => {
        refreshSessions();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-black border border-zinc-800 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Saved Sessions
                        </h2>
                        <div className="text-xs text-zinc-500">
                            {sessions.length} session{sessions.length !== 1 ? 's' : ''} saved
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 border border-zinc-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-zinc-900 transition-colors"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Sessions List */}
            {sessions.length === 0 ? (
                <div className="bg-black border border-zinc-800 p-12 text-center">
                    <Tag className="w-8 h-8 text-zinc-700 mx-auto mb-4" />
                    <div className="text-sm text-zinc-600 uppercase tracking-widest">
                        No sessions saved yet
                    </div>
                    <div className="text-xs text-zinc-700 mt-2">
                        Visit the Display page and save a session to get started
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="bg-black border border-zinc-800 p-6 hover:border-zinc-700 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Tag className="w-4 h-4 text-white" />
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                                            {session.label}
                                        </h3>
                                    </div>
                                    {session.notes && (
                                        <div className="text-xs text-zinc-500 mb-3">
                                            {session.notes}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(session.id)}
                                    className="text-red-500 hover:text-red-400 transition-colors"
                                    title="Delete session"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Session Stats */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="border border-zinc-800 p-3">
                                    <div className="text-[10px] text-zinc-600 uppercase mb-1">Visits</div>
                                    <div className="text-lg font-bold text-white">{session.visitCount}</div>
                                </div>
                                <div className="border border-zinc-800 p-3">
                                    <div className="text-[10px] text-zinc-600 uppercase mb-1">Created</div>
                                    <div className="text-xs text-zinc-400">{formatDate(session.createdAt)}</div>
                                </div>
                                <div className="border border-zinc-800 p-3">
                                    <div className="text-[10px] text-zinc-600 uppercase mb-1">Last Seen</div>
                                    <div className="text-xs text-zinc-400">{formatDate(session.lastSeen)}</div>
                                </div>
                            </div>

                            {/* Fingerprints */}
                            <div className="space-y-2">
                                <div className="border border-zinc-800 p-3">
                                    <div className="text-[10px] text-zinc-600 uppercase mb-1 flex items-center gap-1">
                                        <Fingerprint className="w-3 h-3" />
                                        Canvas Fingerprint
                                    </div>
                                    <div className="font-mono text-xs text-zinc-400 break-all">
                                        {truncateHash(session.canvasFingerprint, 32)}
                                    </div>
                                </div>
                                <div className="border border-zinc-800 p-3">
                                    <div className="text-[10px] text-zinc-600 uppercase mb-1 flex items-center gap-1">
                                        <Fingerprint className="w-3 h-3" />
                                        WebGL Fingerprint
                                    </div>
                                    <div className="font-mono text-xs text-zinc-400 break-all">
                                        {truncateHash(session.webglFingerprint, 32)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
