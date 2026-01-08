import { FontAnalysis } from './utils/fontDetection';
import { WebGLFingerprint } from './utils/webglFingerprint';
import { SeleniumDetection } from './utils/seleniumDetection';

/**
 * Response from IPQS (IPQualityScore) API
 * Used by both frontend services and backend API
 */
export interface IPQSResult {
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
