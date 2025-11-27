import React from 'react';
import { FileText, BookOpen, Code, Database, Shield } from 'lucide-react';

export const CompliancePage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-black border border-zinc-800 p-8">
                <h1 className="text-2xl font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                    <FileText className="w-6 h-6" />
                    Academic Compliance
                </h1>
                <p className="text-sm text-zinc-500 uppercase tracking-wider">
                    Principles of Programming Languages - Research Paper Implementation
                </p>
            </div>

            {/* Paper Reference */}
            <div className="bg-black border border-zinc-800 p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <BookOpen className="w-4 h-4" />
                    Research Paper
                </h2>
                <div className="space-y-3">
                    <div>
                        <div className="text-xs text-zinc-600 uppercase mb-1">Title</div>
                        <div className="text-sm text-white">
                            Fraud Detection via Browser Fingerprinting and Heuristic Profiling
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-zinc-600 uppercase mb-1">Course</div>
                        <div className="text-sm text-zinc-400">
                            Principles of Programming Languages
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-zinc-600 uppercase mb-1">Document (update link to pdf once done on final paper)</div>
                        <a
                            href="https://docs.google.com/document/d/1UwEpgVuXahbGFVw-euwYbXbBD0LvOEqr7kunXDxd_HE/edit?tab=t.0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 underline break-all"
                        >
                            View Research Paper →
                        </a>
                    </div>
                </div>
            </div>

            {/* Implementation Overview */}
            <div className="bg-black border border-zinc-800 p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <Code className="w-4 h-4" />
                    Implementation Overview
                </h2>
                <div className="space-y-4 text-sm text-zinc-400">
                    <p>
                        BLADE (Browser Logging & Anomaly Detection Engine) implements the methodologies
                        described in the research paper for fraud detection through browser fingerprinting
                        and heuristic profiling.
                    </p>
                </div>
            </div>

            {/* Methodology Implementation */}
            <div className="bg-black border border-zinc-800 p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <Database className="w-4 h-4" />
                    Methodology Alignment
                </h2>

                <div className="space-y-6">
                    {/* Section 2.1 - Browser Fingerprinting */}
                    <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                            2.1 Browser Fingerprinting Components
                        </h3>
                        <div className="space-y-3 ml-4">
                            <div className="border-l-2 border-zinc-800 pl-4">
                                <div className="text-xs text-zinc-600 uppercase mb-1">2.1.1 JavaScript API and Spoofing Detection</div>
                                <div className="text-xs text-zinc-400">
                                    ✓ Implemented via <code className="bg-zinc-900 px-1">seleniumDetection.ts</code>
                                    <br />
                                    ✓ Detects navigator.webdriver, automation properties, and headless browsers
                                    <br />
                                    ✓ Identifies discrepancies in browser APIs
                                </div>
                            </div>

                            <div className="border-l-2 border-zinc-800 pl-4">
                                <div className="text-xs text-zinc-600 uppercase mb-1">2.1.2 User-agents and OS Determination</div>
                                <div className="text-xs text-zinc-400">
                                    ✓ Implemented via <code className="bg-zinc-900 px-1">fontDetection.ts</code>
                                    <br />
                                    ✓ Analyzes OS-specific font stacks (Windows/Segoe UI, macOS/San Francisco, Linux/Liberation)
                                    <br />
                                    ✓ Cross-references navigator.platform with font-based OS detection
                                    <br />
                                    ✓ Flags discrepancies indicating spoofing or virtualization
                                </div>
                            </div>

                            <div className="border-l-2 border-zinc-800 pl-4">
                                <div className="text-xs text-zinc-600 uppercase mb-1">2.1.3 TLS Fingerprinting</div>
                                <div className="text-xs text-zinc-400">
                                    (TLS) Wala pa hahgaahga
                                    <br />
                                    WebGL fingerprinting used as alternative GPU-based identifier
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2.2 - Heuristic Profiling */}
                    <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                            2.2 Heuristic Profiling and Scoring
                        </h3>
                        <div className="space-y-3 ml-4">
                            <div className="border-l-2 border-zinc-800 pl-4">
                                <div className="text-xs text-zinc-600 uppercase mb-1">2.2.1 IP Blacklist Checking</div>
                                <div className="text-xs text-zinc-400">
                                    ✓ Implemented via <code className="bg-zinc-900 px-1">ipqsService.ts</code>
                                    <br />
                                    ✓ Integrated IPQualityScore API for accurate IP scoring, using updated blacklists from Spamhaus and other trusted sources.
                                    <br />
                                    ✓ Proxy/VPN/Tor detection
                                    <br />
                                    ✓ Bot status and abuse velocity tracking
                                </div>
                            </div>

                            <div className="border-l-2 border-zinc-800 pl-4">
                                <div className="text-xs text-zinc-600 uppercase mb-1">2.2.2 Aggregation and Scoring</div>
                                <div className="text-xs text-zinc-400">
                                    ✓ Implemented in <code className="bg-zinc-900 px-1">PlaygroundPage.tsx</code>
                                    <br />
                                    ✓ Combines multiple signals: Selenium detection, click speed, form fill time
                                    <br />
                                    ✓ Risk scoring based on IPQS fraud score, automation flags, and behavior metrics
                                    <br />
                                    ✓ Pass/fail determination with detailed reasoning
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Fingerprinting Techniques */}
            <div className="bg-black border border-zinc-800 p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <Shield className="w-4 h-4" />
                    Additional Techniques
                </h2>
                <div className="space-y-3">
                    <div className="border-l-2 border-green-900 pl-4">
                        <div className="text-xs text-zinc-600 uppercase mb-1">Canvas Fingerprinting</div>
                        <div className="text-xs text-zinc-400">
                            Generates unique hash based on canvas rendering variations across browsers and systems
                        </div>
                    </div>
                    <div className="border-l-2 border-green-900 pl-4">
                        <div className="text-xs text-zinc-600 uppercase mb-1">WebGL Fingerprinting</div>
                        <div className="text-xs text-zinc-400">
                            Extracts GPU vendor, renderer, and WebGL parameters for hardware-based identification
                        </div>
                    </div>
                    <div className="border-l-2 border-green-900 pl-4">
                        <div className="text-xs text-zinc-600 uppercase mb-1">Behavior Analysis</div>
                        <div className="text-xs text-zinc-400">
                            Tracks click patterns, form fill times, and interaction speeds to detect bots
                        </div>
                    </div>
                </div>
            </div>

            {/* Implementation Files */}
            <div className="bg-black border border-zinc-800 p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
                    Source Code Files
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-zinc-950 border border-zinc-800 p-3">
                        <div className="text-zinc-600 uppercase mb-1">Utilities</div>
                        <div className="space-y-1 text-zinc-400 font-mono">
                            <div>• fontDetection.ts</div>
                            <div>• webglFingerprint.ts</div>
                            <div>• seleniumDetection.ts</div>
                        </div>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 p-3">
                        <div className="text-zinc-600 uppercase mb-1">Services</div>
                        <div className="space-y-1 text-zinc-400 font-mono">
                            <div>• ipqsService.ts</div>
                            <div>• fingerprint.ts</div>
                        </div>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 p-3">
                        <div className="text-zinc-600 uppercase mb-1">Components</div>
                        <div className="space-y-1 text-zinc-400 font-mono">
                            <div>• DisplayPage.tsx</div>
                            <div>• PlaygroundPage.tsx</div>
                        </div>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 p-3">
                        <div className="text-zinc-600 uppercase mb-1">Types</div>
                        <div className="space-y-1 text-zinc-400 font-mono">
                            <div>• types.ts</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conclusion */}
            <div className="bg-black border border-zinc-800 p-6">
                <div className="text-xs text-zinc-500 leading-relaxed">
                    This implementation demonstrates practical application of the fraud detection methodologies
                    outlined in the research paper, combining browser fingerprinting techniques with heuristic
                    profiling to create a comprehensive anomaly detection system. The system successfully
                    identifies automated browsers, spoofed environments, and suspicious behavior patterns
                    through multi-layered analysis.
                </div>
            </div>
        </div>
    );
};
