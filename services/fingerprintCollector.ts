import { FingerprintData } from '../types';
import { getPublicIP, getCanvasFingerprint } from './fingerprint';
import { getIPQualityScore } from './ipqsService';
import { analyzeFonts } from '../utils/fontDetection';
import { getWebGLFingerprint } from '../utils/webglFingerprint';
import { detectSeleniumAndHeadless } from '../utils/seleniumDetection';

/**
 * Collects all fingerprint data from the browser
 * This centralizes the fingerprint collection logic to avoid duplication
 */
export async function collectFingerprint(): Promise<FingerprintData> {
    const ip = await getPublicIP();
    const ipqs = await getIPQualityScore(ip);
    const canvas = await getCanvasFingerprint();
    const webgl = getWebGLFingerprint();
    const fonts = await analyzeFonts();
    const selenium = detectSeleniumAndHeadless();

    return {
        ip,
        ipqs,
        canvas,
        webgl,
        fonts,
        selenium,
        timestamp: Date.now()
    };
}
