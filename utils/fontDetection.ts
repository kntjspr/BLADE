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

// Common fonts to test for each OS
const OS_FONTS = {
    windows: [
        'Segoe UI',
        'Calibri',
        'Consolas',
        'Arial',
        'Tahoma',
        'Verdana',
        'MS Sans Serif',
        'MS Serif'
    ],
    macos: [
        'San Francisco',
        'SF Pro Display',
        'SF Pro Text',
        'Helvetica Neue',
        'Lucida Grande',
        'Monaco',
        'Menlo'
    ],
    linux: [
        'Liberation Sans',
        'Liberation Serif',
        'Liberation Mono',
        'DejaVu Sans',
        'DejaVu Serif',
        'DejaVu Sans Mono',
        'Ubuntu',
        'Noto Sans'
    ]
};

/**
 * Test if a font is available on the system
 */
function isFontAvailable(fontName: string): boolean {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return false;

    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const baselineFont = 'monospace';

    context.font = testSize + ' ' + baselineFont;
    const baselineWidth = context.measureText(testString).width;

    context.font = testSize + ' ' + fontName + ', ' + baselineFont;
    const testWidth = context.measureText(testString).width;

    return baselineWidth !== testWidth;
}

/**
 * Detect OS from navigator
 */
function getOSFromNavigator(): string {
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();

    if (platform.includes('win')) return 'Windows';
    if (platform.includes('mac')) return 'macOS';
    if (platform.includes('linux')) return 'Linux';

    // Fallback to user agent
    if (userAgent.includes('windows')) return 'Windows';
    if (userAgent.includes('mac')) return 'macOS';
    if (userAgent.includes('linux')) return 'Linux';
    if (userAgent.includes('android')) return 'Android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS';

    return 'Unknown';
}

/**
 * Detect OS from available fonts
 */
function getOSFromFonts(detectedFonts: string[]): { os: string; confidence: string } {
    let windowsScore = 0;
    let macosScore = 0;
    let linuxScore = 0;

    detectedFonts.forEach(font => {
        if (OS_FONTS.windows.some(f => f.toLowerCase() === font.toLowerCase())) {
            windowsScore++;
        }
        if (OS_FONTS.macos.some(f => f.toLowerCase() === font.toLowerCase())) {
            macosScore++;
        }
        if (OS_FONTS.linux.some(f => f.toLowerCase() === font.toLowerCase())) {
            linuxScore++;
        }
    });

    const maxScore = Math.max(windowsScore, macosScore, linuxScore);

    if (maxScore === 0) return { os: 'Unknown', confidence: 'low' };

    let os = 'Unknown';
    if (windowsScore === maxScore) os = 'Windows';
    else if (macosScore === maxScore) os = 'macOS';
    else if (linuxScore === maxScore) os = 'Linux';

    const confidence = maxScore >= 3 ? 'high' : maxScore >= 2 ? 'medium' : 'low';

    return { os, confidence };
}

/**
 * Perform comprehensive font detection and OS analysis
 */
export async function analyzeFonts(): Promise<FontAnalysis> {
    const detectedFonts: string[] = [];

    // Test all OS-specific fonts
    const allFonts = [
        ...OS_FONTS.windows,
        ...OS_FONTS.macos,
        ...OS_FONTS.linux
    ];

    for (const font of allFonts) {
        if (isFontAvailable(font)) {
            detectedFonts.push(font);
        }
    }

    const osFromNavigator = getOSFromNavigator();
    const { os: osFromFonts, confidence } = getOSFromFonts(detectedFonts);

    const hasDiscrepancy = osFromNavigator !== osFromFonts && osFromFonts !== 'Unknown';

    return {
        detectedFonts,
        osFromFonts: `${osFromFonts} (${confidence} confidence)`,
        osFromNavigator,
        hasDiscrepancy,
        explanation: '', // Removed detailed explanation as requested
        platformDetails: {
            windows: detectedFonts.some(f => OS_FONTS.windows.includes(f)),
            macos: detectedFonts.some(f => OS_FONTS.macos.includes(f)),
            linux: detectedFonts.some(f => OS_FONTS.linux.includes(f))
        }
    };
}
