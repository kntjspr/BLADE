import React, { useState, useEffect } from 'react';
import { Shield, Globe, Fingerprint, Eye, Type, Cpu, AlertTriangle, CheckCircle, Save, Tag, Clock } from 'lucide-react';
import { getPublicIP, getCanvasFingerprint } from '../services/fingerprint';
import { getIPQualityScore } from '../services/ipqsService';
import { analyzeFonts } from '../utils/fontDetection';
import { getWebGLFingerprint } from '../utils/webglFingerprint';
import { detectSeleniumAndHeadless } from '../utils/seleniumDetection';
import { FingerprintData, SessionMatch, Session } from '../types';
import { loadSessions, findMatchingSession, createSession, updateSessionVisit } from '../services/sessionStorage';

export const DisplayPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null);
    const [sessionMatch, setSessionMatch] = useState<SessionMatch | null>(null);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [sessionLabel, setSessionLabel] = useState('');
    const [sessions, setSessions] = useState<Session[]>([]);

    useEffect(() => {
        // Fetch sessions from database and collect fingerprint
        fetchSessionsAndCollectFingerprint();
    }, []);

    const fetchSessionsAndCollectFingerprint = async () => {
        setLoading(true);
        try {
            // Fetch all sessions from database first
            const allSessions = await loadSessions();
            setSessions(allSessions);

            // Then collect fingerprint and match
            await collectFingerprint(allSessions);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const collectFingerprint = async (allSessions: Session[]) => {
        try {
            const ip = await getPublicIP();
            const ipqs = await getIPQualityScore(ip);
            const canvas = await getCanvasFingerprint();
            const webgl = getWebGLFingerprint();
            const fonts = await analyzeFonts();
            const selenium = detectSeleniumAndHeadless();

            const fingerprintData: FingerprintData = {
                ip,
                ipqs,
                canvas,
                webgl,
                fonts,
                selenium,
                timestamp: Date.now()
            };

            setFingerprint(fingerprintData);

            // Automatically check for matching session
            const match = findMatchingSession(canvas, webgl.hash, allSessions);
            if (match) {
                setSessionMatch(match);
                // Auto-update visit count in background
                updateSessionVisit(match.session.id);
            }
        } catch (error) {
            console.error('Error collecting fingerprint:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSession = async () => {
        if (!fingerprint || !sessionLabel.trim()) return;

        const newSession = await createSession(
            sessionLabel.trim(),
            fingerprint.canvas,
            fingerprint.webgl.hash
        );

        if (newSession) {
            setShowSaveDialog(false);
            setSessionLabel('');

            // Refresh sessions and check for match
            const allSessions = await loadSessions();
            setSessions(allSessions);
            const match = findMatchingSession(fingerprint.canvas, fingerprint.webgl.hash, allSessions);
            setSessionMatch(match);
        }
    };

    if (loading || !fingerprint) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-4 h-4 bg-white animate-ping mx-auto mb-4"></div>
                    <div className="text-xs uppercase tracking-widest text-zinc-500">
                        Collecting Fingerprint Data...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Session Match Banner */}
            {sessionMatch && (
                <div className={`border p-4 ${sessionMatch.matchType === 'exact'
                    ? 'bg-green-950 border-green-900'
                    : 'bg-yellow-950 border-yellow-900'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Tag className={`w-5 h-5 ${sessionMatch.matchType === 'exact' ? 'text-green-500' : 'text-yellow-500'
                                }`} />
                            <div>
                                <div className="text-sm font-bold text-white uppercase tracking-widest">
                                    Session Matched: {sessionMatch.session.label}
                                </div>
                                <div className="text-xs text-zinc-400 mt-1">
                                    {sessionMatch.matchType === 'exact' ? 'Exact Match' : 'Partial Match'} •
                                    Confidence: {sessionMatch.confidence}% •
                                    Visits: {sessionMatch.session.visitCount}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Clock className="w-3 h-3" />
                            Last seen: {new Date(sessionMatch.session.lastSeen).toLocaleString()}
                        </div>
                    </div>
                </div>
            )}

            {/* Save Session Button */}
            {!sessionMatch && fingerprint && (
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                    {!showSaveDialog ? (
                        <button
                            onClick={() => setShowSaveDialog(true)}
                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-zinc-300 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save This Session
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <div className="text-xs text-zinc-500 uppercase tracking-widest">Save Session</div>
                            <input
                                type="text"
                                value={sessionLabel}
                                onChange={(e) => setSessionLabel(e.target.value)}
                                placeholder="Enter session label (e.g., 'My Laptop', 'Work PC')..."
                                className="w-full bg-black border border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveSession}
                                    disabled={!sessionLabel.trim()}
                                    className="bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-zinc-300 disabled:bg-zinc-700 disabled:text-zinc-500 transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSaveDialog(false);
                                        setSessionLabel('');
                                    }}
                                    className="border border-zinc-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-zinc-900 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* IP Address Section */}
            <div className="bg-black border border-zinc-800 p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <Globe className="w-4 h-4" />
                    Current IP Address
                </h2>
                <div className="text-2xl font-mono text-white">{fingerprint.ip}</div>
                {fingerprint.ipqs && (
                    <div className="mt-2 text-xs text-zinc-500">
                        {fingerprint.ipqs.city}, {fingerprint.ipqs.region}, {fingerprint.ipqs.country_code}
                    </div>
                )}
            </div>

            {/* IPQS Score Section */}
            {fingerprint.ipqs && fingerprint.ipqs.success && (
                <div className="bg-black border border-zinc-800 p-6">
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <Shield className="w-4 h-4" />
                        IP Address Analysis
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="border border-zinc-800 p-3">
                            <div className="text-[10px] text-zinc-600 uppercase mb-1">Fraud Score</div>
                            <div className={`text-xl font-bold ${fingerprint.ipqs.fraud_score > 75 ? 'text-red-500' : fingerprint.ipqs.fraud_score > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                                {fingerprint.ipqs.fraud_score}
                            </div>
                        </div>
                        <div className="border border-zinc-800 p-3">
                            <div className="text-[10px] text-zinc-600 uppercase mb-1">Proxy</div>
                            <div className={`text-sm font-bold ${fingerprint.ipqs.proxy ? 'text-red-500' : 'text-green-500'}`}>
                                {fingerprint.ipqs.proxy ? 'YES' : 'NO'}
                            </div>
                        </div>
                        <div className="border border-zinc-800 p-3">
                            <div className="text-[10px] text-zinc-600 uppercase mb-1">VPN</div>
                            <div className={`text-sm font-bold ${fingerprint.ipqs.vpn ? 'text-red-500' : 'text-green-500'}`}>
                                {fingerprint.ipqs.vpn ? 'YES' : 'NO'}
                            </div>
                        </div>
                        <div className="border border-zinc-800 p-3">
                            <div className="text-[10px] text-zinc-600 uppercase mb-1">Bot Status</div>
                            <div className={`text-sm font-bold ${fingerprint.ipqs.bot_status ? 'text-red-500' : 'text-green-500'}`}>
                                {fingerprint.ipqs.bot_status ? 'YES' : 'NO'}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="flex justify-between border-b border-zinc-900 pb-1">
                            <span className="text-zinc-600">ISP:</span>
                            <span className="text-zinc-400">{fingerprint.ipqs.ISP}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-900 pb-1">
                            <span className="text-zinc-600">Organization:</span>
                            <span className="text-zinc-400">{fingerprint.ipqs.organization}</span>
                        </div>

                        <div className="flex justify-between border-b border-zinc-900 pb-1">
                            <span className="text-zinc-600">Mobile:</span>
                            <span className="text-zinc-400">{fingerprint.ipqs.mobile ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Canvas Fingerprint */}
            <div className="bg-black border border-zinc-800 p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <Fingerprint className="w-4 h-4" />
                    Canvas Fingerprint Hash
                </h2>
                <div className="font-mono text-sm text-zinc-400 break-all bg-zinc-950 p-4 border border-zinc-800">
                    {fingerprint.canvas}
                </div>
            </div>

            {/* Font Detection & OS Analysis */}
            <div className="bg-black border border-zinc-800 p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <Type className="w-4 h-4" />
                    Font Detection & OS Fingerprinting
                </h2>

                {/* Detection Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="border border-zinc-800 p-4">
                        <div className="text-[10px] text-zinc-600 uppercase mb-2">OS from Navigator</div>
                        <div className="text-lg font-bold text-white">{fingerprint.fonts.osFromNavigator}</div>
                        <div className="text-[10px] text-zinc-600 mt-1">
                            navigator.platform: {navigator.platform}
                        </div>
                    </div>
                    <div className="border border-zinc-800 p-4">
                        <div className="text-[10px] text-zinc-600 uppercase mb-2">OS from Font Stack</div>
                        <div className="text-lg font-bold text-white">{fingerprint.fonts.osFromFonts}</div>
                    </div>
                </div>

                {/* Discrepancy Warning */}
                {fingerprint.fonts.hasDiscrepancy && (
                    <div className="bg-red-950 border border-red-900 p-4 mb-4">
                        <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            DISCREPANCY DETECTED
                        </div>
                        <div className="text-xs text-red-400">
                            The OS detected from font availability does not match the OS reported by navigator.platform.
                            This could indicate browser spoofing or virtualization.
                        </div>
                    </div>
                )}

                {/* Platform Details */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className={`border p-3 text-center ${fingerprint.fonts.platformDetails.windows ? 'border-white bg-zinc-900' : 'border-zinc-800'}`}>
                        <div className="text-[10px] text-zinc-600 uppercase mb-1">Windows Fonts</div>
                        <div className={`text-sm font-bold ${fingerprint.fonts.platformDetails.windows ? 'text-white' : 'text-zinc-700'}`}>
                            {fingerprint.fonts.platformDetails.windows ? 'DETECTED' : 'NOT FOUND'}
                        </div>
                    </div>
                    <div className={`border p-3 text-center ${fingerprint.fonts.platformDetails.macos ? 'border-white bg-zinc-900' : 'border-zinc-800'}`}>
                        <div className="text-[10px] text-zinc-600 uppercase mb-1">macOS Fonts</div>
                        <div className={`text-sm font-bold ${fingerprint.fonts.platformDetails.macos ? 'text-white' : 'text-zinc-700'}`}>
                            {fingerprint.fonts.platformDetails.macos ? 'DETECTED' : 'NOT FOUND'}
                        </div>
                    </div>
                    <div className={`border p-3 text-center ${fingerprint.fonts.platformDetails.linux ? 'border-white bg-zinc-900' : 'border-zinc-800'}`}>
                        <div className="text-[10px] text-zinc-600 uppercase mb-1">Linux Fonts</div>
                        <div className={`text-sm font-bold ${fingerprint.fonts.platformDetails.linux ? 'text-white' : 'text-zinc-700'}`}>
                            {fingerprint.fonts.platformDetails.linux ? 'DETECTED' : 'NOT FOUND'}
                        </div>
                    </div>
                </div>

                {/* Detected Fonts List */}
                <div className="border border-zinc-800 p-4">
                    <div className="text-[10px] text-zinc-600 uppercase mb-2">
                        Detected Fonts ({fingerprint.fonts.detectedFonts.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {fingerprint.fonts.detectedFonts.map((font, idx) => (
                            <span key={idx} className="text-xs bg-zinc-900 border border-zinc-800 px-2 py-1 text-zinc-400">
                                {font}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* WebGL Hash */}
            <div className="bg-black border border-zinc-800 p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <Cpu className="w-4 h-4" />
                    WebGL Fingerprint
                </h2>
                {fingerprint.webgl.supported ? (
                    <>
                        <div className="font-mono text-sm text-zinc-400 break-all bg-zinc-950 p-4 border border-zinc-800 mb-4">
                            {fingerprint.webgl.hash}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="flex justify-between border-b border-zinc-900 pb-1">
                                <span className="text-zinc-600">Vendor:</span>
                                <span className="text-zinc-400">{fingerprint.webgl.vendor}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-900 pb-1">
                                <span className="text-zinc-600">Renderer:</span>
                                <span className="text-zinc-400 truncate ml-2">{fingerprint.webgl.renderer}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-900 pb-1">
                                <span className="text-zinc-600">Version:</span>
                                <span className="text-zinc-400">{fingerprint.webgl.version}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-900 pb-1">
                                <span className="text-zinc-600">Shading Language:</span>
                                <span className="text-zinc-400">{fingerprint.webgl.shadingLanguageVersion}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-zinc-600 text-sm">WebGL not supported</div>
                )}
            </div>

            {/* Selenium Detection */}
            <div className="bg-black border border-zinc-800 p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <Eye className="w-4 h-4" />
                    Selenium & Headless Detection
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className={`border p-3 text-center ${fingerprint.selenium.isAutomated ? 'border-red-500 bg-red-950' : 'border-green-500 bg-green-950'}`}>
                        <div className="text-[10px] text-zinc-600 uppercase mb-1">Automated</div>
                        <div className={`text-sm font-bold ${fingerprint.selenium.isAutomated ? 'text-red-500' : 'text-green-500'}`}>
                            {fingerprint.selenium.isAutomated ? 'YES' : 'NO'}
                        </div>
                    </div>
                    <div className={`border p-3 text-center ${fingerprint.selenium.isSelenium ? 'border-red-500' : 'border-zinc-800'}`}>
                        <div className="text-[10px] text-zinc-600 uppercase mb-1">Selenium</div>
                        <div className={`text-sm font-bold ${fingerprint.selenium.isSelenium ? 'text-red-500' : 'text-zinc-400'}`}>
                            {fingerprint.selenium.isSelenium ? 'DETECTED' : 'NOT FOUND'}
                        </div>
                    </div>
                    <div className={`border p-3 text-center ${fingerprint.selenium.isHeadless ? 'border-red-500' : 'border-zinc-800'}`}>
                        <div className="text-[10px] text-zinc-600 uppercase mb-1">Headless</div>
                        <div className={`text-sm font-bold ${fingerprint.selenium.isHeadless ? 'text-red-500' : 'text-zinc-400'}`}>
                            {fingerprint.selenium.isHeadless ? 'DETECTED' : 'NOT FOUND'}
                        </div>
                    </div>
                    <div className={`border p-3 text-center ${fingerprint.selenium.isPhantomJS ? 'border-red-500' : 'border-zinc-800'}`}>
                        <div className="text-[10px] text-zinc-600 uppercase mb-1">PhantomJS</div>
                        <div className={`text-sm font-bold ${fingerprint.selenium.isPhantomJS ? 'text-red-500' : 'text-zinc-400'}`}>
                            {fingerprint.selenium.isPhantomJS ? 'DETECTED' : 'NOT FOUND'}
                        </div>
                    </div>
                </div>

                <div className="border border-zinc-800 p-4 mb-4">
                    <div className="text-[10px] text-zinc-600 uppercase mb-2">Risk Score</div>
                    <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold ${fingerprint.selenium.riskScore > 50 ? 'text-red-500' : 'text-green-500'}`}>
                            {fingerprint.selenium.riskScore}%
                        </div>
                        <div className="flex-1 bg-zinc-900 h-2 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${fingerprint.selenium.riskScore > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${fingerprint.selenium.riskScore}%` }}
                            />
                        </div>
                    </div>
                </div>

                {fingerprint.selenium.detectedIndicators.length > 0 && (
                    <div className="border border-zinc-800 p-4">
                        <div className="text-[10px] text-zinc-600 uppercase mb-2">
                            Detected Indicators ({fingerprint.selenium.detectedIndicators.length})
                        </div>
                        <div className="space-y-1">
                            {fingerprint.selenium.detectedIndicators.map((indicator, idx) => (
                                <div key={idx} className="text-xs text-red-400 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-red-500"></span>
                                    {indicator}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
