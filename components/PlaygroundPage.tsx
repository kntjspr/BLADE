import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getPublicIP, getCanvasFingerprint } from '../services/fingerprint';
import { getIPQualityScore } from '../services/ipqsService';
import { analyzeFonts } from '../utils/fontDetection';
import { getWebGLFingerprint } from '../utils/webglFingerprint';
import { detectSeleniumAndHeadless } from '../utils/seleniumDetection';
import { PlaygroundFormData, PlaygroundResult, FingerprintData } from '../types';

export const PlaygroundPage: React.FC = () => {
    const [formData, setFormData] = useState<PlaygroundFormData>({
        name: '',
        email: '',
        message: ''
    });
    const [result, setResult] = useState<PlaygroundResult | null>(null);
    const [loading, setLoading] = useState(false);

    // Behavior tracking
    const [clickTimes, setClickTimes] = useState<number[]>([]);
    const [formStartTime, setFormStartTime] = useState<number | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        // Track when user starts filling the form
        const handleFirstInput = () => {
            if (!formStartTime) {
                setFormStartTime(Date.now());
            }
        };

        const form = formRef.current;
        if (form) {
            form.addEventListener('input', handleFirstInput);
            return () => form.removeEventListener('input', handleFirstInput);
        }
    }, [formStartTime]);

    const handleClick = () => {
        const now = Date.now();
        setClickTimes(prev => [...prev, now]);
    };

    const calculateClickSpeed = (): number => {
        if (clickTimes.length < 2) return 0;

        const intervals: number[] = [];
        for (let i = 1; i < clickTimes.length; i++) {
            intervals.push(clickTimes[i] - clickTimes[i - 1]);
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        return Math.round(avgInterval);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        handleClick();

        setLoading(true);

        try {
            // Collect fingerprint data
            const ip = await getPublicIP();
            const ipqs = await getIPQualityScore(ip);
            const canvas = getCanvasFingerprint();
            const webgl = getWebGLFingerprint();
            const fonts = await analyzeFonts();
            const selenium = detectSeleniumAndHeadless();

            const fingerprint: FingerprintData = {
                ip,
                ipqs,
                canvas,
                webgl,
                fonts,
                selenium,
                timestamp: Date.now()
            };

            // Calculate behavior metrics
            const clickSpeed = calculateClickSpeed();
            const formFillTime = formStartTime ? Math.round((Date.now() - formStartTime) / 1000) : 0;

            // Determine if suspicious
            const suspiciousReasons: string[] = [];

            if (selenium.isAutomated) {
                suspiciousReasons.push('Automated browser detected (Selenium/Headless)');
            }

            if (clickSpeed > 0 && clickSpeed < 100) {
                suspiciousReasons.push(`Abnormally fast click speed: ${clickSpeed}ms (human average: 200-500ms)`);
            }

            if (formFillTime < 3 && formData.name && formData.email && formData.message) {
                suspiciousReasons.push(`Form filled too quickly: ${formFillTime}s (suspicious for complete form)`);
            }

            if (ipqs && ipqs.success) {
                if (ipqs.fraud_score > 75) {
                    suspiciousReasons.push(`High fraud score: ${ipqs.fraud_score}`);
                }
                if (ipqs.proxy || ipqs.vpn) {
                    suspiciousReasons.push('Proxy or VPN detected');
                }
                if (ipqs.bot_status) {
                    suspiciousReasons.push('Bot status flagged by IPQS');
                }
            }

            const passed = suspiciousReasons.length === 0;

            setResult({
                passed,
                suspiciousReasons,
                clickSpeed,
                formFillTime,
                fingerprint
            });
        } catch (error) {
            console.error('Error processing form:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setFormData({ name: '', email: '', message: '' });
        setClickTimes([]);
        setFormStartTime(null);
    };

    if (result) {
        return (
            <div className="space-y-6">
                {/* Pass/Fail Header */}
                <div className={`border p-8 text-center ${result.passed ? 'border-green-500 bg-green-950' : 'border-red-500 bg-red-950'}`}>
                    <div className="flex items-center justify-center gap-4 mb-4">
                        {result.passed ? (
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        ) : (
                            <XCircle className="w-12 h-12 text-red-500" />
                        )}
                    </div>
                    <h2 className={`text-3xl font-bold uppercase tracking-widest mb-2 ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                        {result.passed ? 'PASSED' : 'FAILED'}
                    </h2>
                    <p className="text-sm text-zinc-400 uppercase tracking-wider">
                        {result.passed ? 'No suspicious activity detected' : 'Suspicious activity detected'}
                    </p>
                </div>

                {/* Suspicious Reasons */}
                {!result.passed && result.suspiciousReasons.length > 0 && (
                    <div className="bg-black border border-red-900 p-6">
                        <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-red-900 pb-2">
                            <AlertTriangle className="w-4 h-4" />
                            Suspicious Indicators
                        </h3>
                        <div className="space-y-2">
                            {result.suspiciousReasons.map((reason, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm text-red-400">
                                    <span className="w-1 h-1 bg-red-500 mt-2"></span>
                                    <span>{reason}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Behavior Metrics */}
                <div className="bg-black border border-zinc-800 p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
                        Behavior Metrics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-zinc-800 p-4">
                            <div className="text-[10px] text-zinc-600 uppercase mb-1">Click Speed</div>
                            <div className={`text-xl font-bold ${result.clickSpeed < 100 ? 'text-red-500' : 'text-white'}`}>
                                {result.clickSpeed}ms
                            </div>
                        </div>
                        <div className="border border-zinc-800 p-4">
                            <div className="text-[10px] text-zinc-600 uppercase mb-1">Form Fill Time</div>
                            <div className={`text-xl font-bold ${result.formFillTime < 3 ? 'text-red-500' : 'text-white'}`}>
                                {result.formFillTime}s
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Details - Fingerprint Summary */}
                <div className="bg-black border border-zinc-800 p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
                        Additional Details
                    </h3>

                    <div className="space-y-4">
                        {/* Canvas Fingerprint */}
                        <div>
                            <div className="text-[10px] text-zinc-600 uppercase mb-2">Canvas Fingerprint</div>
                            <div className="font-mono text-xs text-zinc-400 bg-zinc-950 p-3 border border-zinc-800 break-all">
                                {result.fingerprint.canvas}
                            </div>
                        </div>

                        {/* WebGL Hash */}
                        <div>
                            <div className="text-[10px] text-zinc-600 uppercase mb-2">WebGL Hash</div>
                            <div className="font-mono text-xs text-zinc-400 bg-zinc-950 p-3 border border-zinc-800 break-all">
                                {result.fingerprint.webgl.hash}
                            </div>
                        </div>

                        {/* IP & Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] text-zinc-600 uppercase mb-2">IP Address</div>
                                <div className="text-sm text-white">{result.fingerprint.ip}</div>
                            </div>
                            {result.fingerprint.ipqs && (
                                <div>
                                    <div className="text-[10px] text-zinc-600 uppercase mb-2">Fraud Score</div>
                                    <div className={`text-sm font-bold ${result.fingerprint.ipqs.fraud_score > 75 ? 'text-red-500' : result.fingerprint.ipqs.fraud_score > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                                        {result.fingerprint.ipqs.fraud_score}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selenium Detection */}
                        <div>
                            <div className="text-[10px] text-zinc-600 uppercase mb-2">Automation Detection</div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className={`border p-2 text-center ${result.fingerprint.selenium.isSelenium ? 'border-red-500 bg-red-950' : 'border-zinc-800'}`}>
                                    <div className="text-[9px] text-zinc-600 uppercase">Selenium</div>
                                    <div className={`text-xs font-bold ${result.fingerprint.selenium.isSelenium ? 'text-red-500' : 'text-zinc-400'}`}>
                                        {result.fingerprint.selenium.isSelenium ? 'YES' : 'NO'}
                                    </div>
                                </div>
                                <div className={`border p-2 text-center ${result.fingerprint.selenium.isHeadless ? 'border-red-500 bg-red-950' : 'border-zinc-800'}`}>
                                    <div className="text-[9px] text-zinc-600 uppercase">Headless</div>
                                    <div className={`text-xs font-bold ${result.fingerprint.selenium.isHeadless ? 'text-red-500' : 'text-zinc-400'}`}>
                                        {result.fingerprint.selenium.isHeadless ? 'YES' : 'NO'}
                                    </div>
                                </div>
                                <div className={`border p-2 text-center ${result.fingerprint.selenium.isAutomated ? 'border-red-500 bg-red-950' : 'border-green-500 bg-green-950'}`}>
                                    <div className="text-[9px] text-zinc-600 uppercase">Automated</div>
                                    <div className={`text-xs font-bold ${result.fingerprint.selenium.isAutomated ? 'text-red-500' : 'text-green-500'}`}>
                                        {result.fingerprint.selenium.isAutomated ? 'YES' : 'NO'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* OS Detection */}
                        <div>
                            <div className="text-[10px] text-zinc-600 uppercase mb-2">OS Detection</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between border-b border-zinc-900 pb-1">
                                    <span className="text-zinc-600">From Navigator:</span>
                                    <span className="text-zinc-400">{result.fingerprint.fonts.osFromNavigator}</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-900 pb-1">
                                    <span className="text-zinc-600">From Fonts:</span>
                                    <span className="text-zinc-400">{result.fingerprint.fonts.osFromFonts}</span>
                                </div>
                            </div>
                            {result.fingerprint.fonts.hasDiscrepancy && (
                                <div className="mt-2 text-xs text-red-400 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    OS discrepancy detected
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reset Button */}
                <button
                    onClick={handleReset}
                    className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-4 uppercase tracking-widest transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-black border border-zinc-800 p-8">
                <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-2">
                    Playground Form
                </h2>
                <p className="text-xs text-zinc-500 mb-6 uppercase tracking-wider">
                    Submit this form to test fingerprinting and behavior detection
                </p>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs text-zinc-600 uppercase tracking-wider mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            onClick={handleClick}
                            className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-white focus:outline-none transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-600 uppercase tracking-wider mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            onClick={handleClick}
                            className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-white focus:outline-none transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-600 uppercase tracking-wider mb-2">
                            Message
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            onClick={handleClick}
                            rows={4}
                            className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-white focus:outline-none transition-colors resize-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        onClick={handleClick}
                        className="w-full bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 font-bold py-4 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-2 h-2 bg-black animate-ping"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Submit
                            </>
                        )}
                    </button>
                </form>

                {clickTimes.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-zinc-800">
                        <div className="text-[10px] text-zinc-600 uppercase mb-2">Live Behavior Tracking</div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="flex justify-between">
                                <span className="text-zinc-600">Clicks:</span>
                                <span className="text-zinc-400">{clickTimes.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-600">Avg Click Speed:</span>
                                <span className="text-zinc-400">{calculateClickSpeed()}ms</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
