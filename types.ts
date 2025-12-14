import { IPQSResult } from './services/ipqsService';
import { FontAnalysis } from './utils/fontDetection';
import { WebGLFingerprint } from './utils/webglFingerprint';
import { SeleniumDetection } from './utils/seleniumDetection';

// Browser profile for fingerprinting
export interface BrowserProfile {
  user_agent: string;
  fonts: string[];
  canvas_hash: string;
  timezone: string;
  language: string;
}

// Fingerprint data collected from the browser
export interface FingerprintData {
  ip: string;
  ipqs: IPQSResult | null;
  canvas: string;
  webgl: WebGLFingerprint;
  fonts: FontAnalysis;
  selenium: SeleniumDetection;
  timestamp: number;
}

// Session stored in the database
export interface Session {
  id: string;
  label: string;
  canvasFingerprint: string;
  webglFingerprint: string;
  createdAt: number;
  lastSeen: number;
  visitCount: number;
  notes?: string;
}

// Match result for session lookup
export interface SessionMatch {
  session: Session;
  matchType: 'exact' | 'partial';
  confidence: number;
}
