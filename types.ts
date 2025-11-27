// Browser fingerprinting types
export interface BrowserProfile {
  user_agent: string;
  fonts: string[];
  canvas_hash: string;
  timezone: string;
  language: string;
}

// Font analysis types
export interface FontAnalysis {
  detectedFonts: string[];
  osFromFonts: string;
  osFromNavigator: string;
  hasDiscrepancy: boolean;
  explanation: string;
  platformDetails: {
    windows: boolean;
    macos: boolean;
    linux: boolean;
  };
}

// WebGL fingerprint types
export interface WebGLFingerprint {
  hash: string;
  vendor: string;
  renderer: string;
  version: string;
  shadingLanguageVersion: string;
  supported: boolean;
  extensions: string[];
}

// Selenium detection types
export interface SeleniumDetection {
  isHeadless: boolean;
  isSelenium: boolean;
  isPhantomJS: boolean;
  isAutomated: boolean;
  detectedIndicators: string[];
  riskScore: number;
}

// IPQS API result types
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

// Complete fingerprint data
export interface FingerprintData {
  ip: string;
  ipqs: IPQSResult | null;
  canvas: string;
  webgl: WebGLFingerprint;
  fonts: FontAnalysis;
  selenium: SeleniumDetection;
  timestamp: number;
}

// Playground form data
export interface PlaygroundFormData {
  name: string;
  email: string;
  message: string;
}

// Playground result
export interface PlaygroundResult {
  passed: boolean;
  suspiciousReasons: string[];
  clickSpeed: number;
  formFillTime: number;
  fingerprint: FingerprintData;
}

// Behavior tracking
export interface BehaviorMetrics {
  click_speed_ms: number;
  session_duration_s: number;
  form_fill_time_s: number;
  click_count: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING_SAMPLE = 'GENERATING_SAMPLE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}