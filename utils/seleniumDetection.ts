export interface SeleniumDetection {
    isHeadless: boolean;
    isSelenium: boolean;
    isPhantomJS: boolean;
    isAutomated: boolean;
    isStealthBot: boolean;
    detectedIndicators: string[];
    riskScore: number; // 0-100
    detectionMethods: string[];
}

/**
 * ADVANCED DETECTION: Check if navigator.webdriver has been tampered with
 * Stealth bots often use Object.defineProperty to hide webdriver
 */
function detectWebdriverTampering(): { detected: boolean; indicators: string[] } {
    const indicators: string[] = [];
    let detected = false;

    try {
        // Check 1: Property descriptor analysis
        const descriptor = Object.getOwnPropertyDescriptor(navigator, 'webdriver');

        if (descriptor) {
            // If the property has a getter that returns undefined, it's likely spoofed
            if (descriptor.get && descriptor.get.toString().includes('undefined')) {
                indicators.push('navigator.webdriver getter returns undefined (spoofed)');
                detected = true;
            }

            // Check if it's been redefined (original should be a data property, not accessor)
            if (descriptor.get || descriptor.set) {
                indicators.push('navigator.webdriver has custom getter/setter (tampering detected)');
                detected = true;
            }

            // Check if property is configurable (original Chrome makes it non-configurable)
            if (descriptor.configurable === true) {
                indicators.push('navigator.webdriver is configurable (should be false)');
                detected = true;
            }
        }

        // Check 2: Prototype chain analysis
        const proto = Object.getPrototypeOf(navigator);
        const protoDescriptor = Object.getOwnPropertyDescriptor(proto, 'webdriver');

        if (protoDescriptor && protoDescriptor.get) {
            // The prototype should have the webdriver getter
            const getterCode = protoDescriptor.get.toString();
            // Check if the getter was modified
            if (getterCode.includes('undefined') || getterCode.includes('false')) {
                indicators.push('Navigator prototype webdriver getter tampered');
                detected = true;
            }
        }

        // Check 3: Compare with fresh navigator check using iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const freshNavigator = (iframe.contentWindow as any)?.navigator;
        if (freshNavigator) {
            const freshWebdriver = freshNavigator.webdriver;
            const currentWebdriver = navigator.webdriver;

            // If current says it's not automated but fresh iframe says it is
            if (freshWebdriver === true && (currentWebdriver === undefined || currentWebdriver === false)) {
                indicators.push('navigator.webdriver mismatch with iframe (stealth spoofing detected)');
                detected = true;
            }
        }

        document.body.removeChild(iframe);

    } catch (e) {
        // Error during detection might indicate tampering
        indicators.push('Error during webdriver tampering check');
    }

    return { detected, indicators };
}

/**
 * ADVANCED DETECTION: Check for ChromeDriver/CDP artifacts
 */
function detectChromeDriverArtifacts(): { detected: boolean; indicators: string[] } {
    const indicators: string[] = [];
    let detected = false;

    // Check for $cdc_ prefixed properties (ChromeDriver injects these)
    const cdcPattern = /^\$cdc_/;
    const cdcPatternAlt = /^cdc_/;

    // Check document
    for (const prop in document) {
        if (cdcPattern.test(prop) || cdcPatternAlt.test(prop)) {
            indicators.push(`ChromeDriver property found in document: ${prop}`);
            detected = true;
        }
    }

    // Check window
    for (const prop in window) {
        if (cdcPattern.test(prop) || cdcPatternAlt.test(prop)) {
            indicators.push(`ChromeDriver property found in window: ${prop}`);
            detected = true;
        }
    }

    // Check for Chrome DevTools Protocol artifacts
    const cdpProps = [
        'chrome',
        '__cdp_sessions',
        '__cdp_binding',
        '__cdc_Session',
    ];

    cdpProps.forEach(prop => {
        if ((window as any)[prop]?.Runtime || (window as any)[prop]?.cdc) {
            indicators.push(`CDP artifact detected: ${prop}`);
            detected = true;
        }
    });

    // Check for automation flags in chrome object
    if (typeof (window as any).chrome === 'object') {
        const chrome = (window as any).chrome;

        // Check if chrome.app exists but has automation indicators
        if (chrome.app && chrome.app.isInstalled === false && !chrome.runtime?.id) {
            // This combination is suspicious - chrome.app exists but no extension context
            // Could be automated Chrome
        }

        // NOTE: chrome.csi and chrome.loadTimes are deprecated and may be missing
        // in normal modern Chrome versions, so we don't use them as detection signals
    }

    return { detected, indicators };
}

/**
 * ADVANCED DETECTION: Error stack analysis for chromedriver
 */
function detectErrorStackAnomalies(): { detected: boolean; indicators: string[] } {
    const indicators: string[] = [];
    let detected = false;

    try {
        // Throw an error and analyze the stack
        throw new Error('Detection probe');
    } catch (e: any) {
        const stack = e.stack || '';

        // Look for chromedriver executable paths in the stack (very specific)
        // Only match actual chromedriver paths, not generic 'webdriver' which can appear in browser internals
        if (/chromedriver\.exe|chromedriver\/|\\chromedriver/i.test(stack)) {
            indicators.push('ChromeDriver executable path found in error stack');
            detected = true;
        }

        // Look for selenium-specific paths
        if (/selenium-webdriver|selenium\.webdriver/i.test(stack)) {
            indicators.push('Selenium WebDriver found in error stack');
            detected = true;
        }

        // Look for cdc_ in stack (ChromeDriver specific artifact)
        if (/\$cdc_[a-zA-Z0-9]+_/i.test(stack)) {
            indicators.push('ChromeDriver artifact ($cdc_) found in error stack');
            detected = true;
        }
    }

    // Check Error.prepareStackTrace (Selenium sometimes modifies this)
    // Be more specific - check for actual webdriver-related modifications
    try {
        const prepareStackTrace = (Error as any).prepareStackTrace;
        if (prepareStackTrace && typeof prepareStackTrace === 'function') {
            const fnString = prepareStackTrace.toString();
            if (/selenium|chromedriver|\$cdc_/i.test(fnString)) {
                indicators.push('Error.prepareStackTrace modified by automation');
                detected = true;
            }
        }
    } catch (e) {
        // Ignore errors accessing prepareStackTrace
    }

    return { detected, indicators };
}

/**
 * ADVANCED DETECTION: Permission API anomalies
 */
function detectPermissionAnomalies(): { detected: boolean; indicators: string[] } {
    const indicators: string[] = [];
    let detected = false;

    // Headless browsers often have inconsistent permission states
    if (navigator.permissions) {
        navigator.permissions.query({ name: 'notifications' as PermissionName }).then(result => {
            // Headless Chrome often returns 'denied' even when not explicitly denied
            // Combined with other signals, this can indicate automation
        }).catch(() => {
            // Permission query failure can indicate automation
            indicators.push('Permission query failure');
        });
    }

    return { detected, indicators };
}

/**
 * ADVANCED DETECTION: Check for automation-controlled features
 */
function detectAutomationControlledFeatures(): { detected: boolean; indicators: string[] } {
    const indicators: string[] = [];
    let detected = false;

    // Check for automation controlled flag in user agent client hints
    if ((navigator as any).userAgentData) {
        const brands = (navigator as any).userAgentData.brands || [];
        for (const brand of brands) {
            if (/automation|headless|webdriver/i.test(brand.brand)) {
                indicators.push(`Automation indicator in userAgentData: ${brand.brand}`);
                detected = true;
            }
        }
    }

    // Check for specific chrome flags
    if (typeof (window as any).chrome === 'object') {
        // Automation extension check
        if ((window as any).chrome.extension === undefined &&
            (window as any).chrome.runtime === undefined &&
            (window as any).chrome.app?.getDetails === undefined) {
            // When running under automation but not as extension, some props are missing
            // This is a heuristic - not definitive on its own
        }
    }

    // Check navigator.plugins array is not frozen or has unusual prototype
    const plugins = navigator.plugins;
    if (Object.isFrozen(plugins) || Object.isSealed(plugins)) {
        indicators.push('navigator.plugins is frozen/sealed (unusual)');
        detected = true;
    }

    // Check for Puppeteer-specific modifications
    if ((navigator as any).__puppeteer_signature || (window as any).__puppeteer) {
        indicators.push('Puppeteer signature detected');
        detected = true;
    }

    // Detect Playwright
    if ((window as any).__playwright || (window as any)._playwrightBinding) {
        indicators.push('Playwright automation detected');
        detected = true;
    }

    return { detected, indicators };
}

/**
 * ADVANCED DETECTION: Timing-based detection
 */
function detectTimingAnomalies(): { detected: boolean; indicators: string[] } {
    const indicators: string[] = [];
    let detected = false;

    // Check if performance.now() has unusual characteristics
    const t1 = performance.now();
    const t2 = performance.now();

    // In some headless modes, timing can be unusual (but not always reliable)
    // We use this more as a supplementary signal

    // Check navigation timing
    if (performance.timing) {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;

        // Extremely fast load times might indicate cached/automated access
        // But this is not definitive
    }

    return { detected, indicators };
}

/**
 * ADVANCED DETECTION: Canvas fingerprint rendering anomalies
 */
function detectCanvasAnomalies(): { detected: boolean; indicators: string[] } {
    const indicators: string[] = [];
    let detected = false;

    try {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Draw specific text to detect rendering differences
            ctx.textBaseline = 'alphabetic';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#333';
            ctx.fillText('BLADE Detection Test 🎭', 10, 30);

            const dataURL = canvas.toDataURL();

            // Check for empty or minimal canvas data (headless rendering issues)
            if (dataURL.length < 1000) {
                indicators.push('Canvas rendered with minimal data (possible headless)');
                detected = true;
            }

            // Check if emoji rendered (headless sometimes fails)
            const emojiCanvas = document.createElement('canvas');
            emojiCanvas.width = 20;
            emojiCanvas.height = 20;
            const emojiCtx = emojiCanvas.getContext('2d');

            if (emojiCtx) {
                emojiCtx.fillText('🎭', 0, 16);
                const emojiData = emojiCanvas.toDataURL();

                // Very short data URL might indicate emoji rendering failure
                if (emojiData.length < 500) {
                    indicators.push('Emoji rendering may have failed (headless indicator)');
                    // Note: Don't set detected=true here as it's a weak signal
                }
            }
        }
    } catch (e) {
        indicators.push('Canvas detection error');
    }

    return { detected, indicators };
}

/**
 * ADVANCED DETECTION: Check for WebGL anomalies common in headless
 */
function detectWebGLAnomalies(): { detected: boolean; indicators: string[] } {
    const indicators: string[] = [];
    let detected = false;

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;

        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

            if (debugInfo) {
                const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

                // SwiftShader is commonly used in headless Chrome
                if (/SwiftShader|Software|llvmpipe|Mesa/i.test(renderer)) {
                    indicators.push(`Software renderer detected: ${renderer}`);
                    detected = true;
                }

                // Check for Google Chrome's headless rendering
                if (/Google SwiftShader/i.test(renderer)) {
                    indicators.push('Google SwiftShader (headless Chrome renderer)');
                    detected = true;
                }
            }
        } else {
            // WebGL not supported - could be headless
            indicators.push('WebGL not available');
            detected = true;
        }
    } catch (e) {
        indicators.push('WebGL detection error');
    }

    return { detected, indicators };
}

/**
 * Detect if running in headless Chrome
 */
function detectHeadlessChrome(): { detected: boolean; indicators: string[] } {
    const indicators: string[] = [];
    let detected = false;

    // Check for headless user agent
    if (/HeadlessChrome/.test(navigator.userAgent)) {
        indicators.push('HeadlessChrome in user agent');
        detected = true;
    }

    // Check for missing plugins
    if (navigator.plugins.length === 0) {
        indicators.push('No plugins detected');
        detected = true;
    }

    // Check for webdriver (basic check - advanced tampering check is separate)
    if (navigator.webdriver === true) {
        indicators.push('navigator.webdriver is true');
        detected = true;
    }

    // Check for missing languages
    if (!navigator.languages || navigator.languages.length === 0) {
        indicators.push('No languages detected');
        detected = true;
    }

    // Check for permissions API
    if (!(navigator as any).permissions) {
        indicators.push('Permissions API missing');
    }

    // Additional headless indicators
    // Check window.chrome existence and properties
    if (!(window as any).chrome) {
        indicators.push('window.chrome missing');
        detected = true;
    }

    // Check for connection info (headless often has no connection)
    const connection = (navigator as any).connection;
    if (connection && connection.rtt === 0) {
        indicators.push('Network connection has 0 RTT (unusual)');
        detected = true;
    }

    // Check screen color depth
    if (screen.colorDepth < 24) {
        indicators.push(`Low color depth: ${screen.colorDepth}`);
        detected = true;
    }

    // Check for broken image in headless
    // Headless might not load images properly
    const img = new Image();
    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    if (img.height === 0 && img.width === 0) {
        // Might indicate broken image handling
    }

    return { detected, indicators };
}

/**
 * Detect Selenium
 */
function detectSelenium(): { detected: boolean; indicators: string[] } {
    const indicators: string[] = [];
    let detected = false;

    // Check for webdriver property (direct check)
    if (navigator.webdriver === true) {
        indicators.push('navigator.webdriver is true');
        detected = true;
    }

    // Check for selenium-specific properties
    const seleniumProps = [
        '__webdriver_evaluate',
        '__selenium_evaluate',
        '__webdriver_script_function',
        '__webdriver_script_func',
        '__webdriver_script_fn',
        '__fxdriver_evaluate',
        '__driver_unwrapped',
        '__webdriver_unwrapped',
        '__driver_evaluate',
        '__selenium_unwrapped',
        '__fxdriver_unwrapped',
        '_Selenium_IDE_Recorder',
        '_selenium',
        'calledSelenium',
        '__nightmare',
        '__nightmarejs'
    ];

    seleniumProps.forEach(prop => {
        if ((document as any)[prop] !== undefined || (window as any)[prop] !== undefined) {
            indicators.push(`${prop} detected`);
            detected = true;
        }
    });

    // Check for callSelenium
    if ((window as any).callSelenium || (window as any)._WEBDRIVER_ELEM_CACHE) {
        indicators.push('Selenium call functions detected');
        detected = true;
    }

    // Check document properties (various versions of ChromeDriver)
    const cdcProps = [
        '$cdc_asdjflasutopfhvcZLmcfl_',
        '$chrome_asyncScriptInfo',
        '$cdc_',
        'cdc_'
    ];

    cdcProps.forEach(prop => {
        if (Object.keys(document).some(key => key.startsWith(prop.replace('$', '\\$')))) {
            indicators.push(`ChromeDriver property pattern detected: ${prop}`);
            detected = true;
        }
    });

    // Deep scan for $cdc_ in document
    for (const key of Object.keys(document)) {
        if (key.includes('cdc') || key.includes('$wdc')) {
            indicators.push(`Suspicious document property: ${key}`);
            detected = true;
            break;
        }
    }

    return { detected, indicators };
}

/**
 * Detect PhantomJS
 */
function detectPhantomJS(): { detected: boolean; indicators: string[] } {
    const indicators: string[] = [];
    let detected = false;

    if ((window as any)._phantom || (window as any).callPhantom) {
        indicators.push('PhantomJS global detected');
        detected = true;
    }

    if (/PhantomJS/.test(navigator.userAgent)) {
        indicators.push('PhantomJS in user agent');
        detected = true;
    }

    // Additional PhantomJS checks
    if ((window as any).__phantomas) {
        indicators.push('Phantomas detected');
        detected = true;
    }

    return { detected, indicators };
}

/**
 * Check for other automation indicators
 */
function detectOtherAutomation(): { detected: boolean; indicators: string[] } {
    const indicators: string[] = [];
    let detected = false;

    // Check for inconsistent screen dimensions
    if (screen.width === 0 || screen.height === 0) {
        indicators.push('Invalid screen dimensions');
        detected = true;
    }

    // Check for missing notification permission
    if (!('Notification' in window)) {
        indicators.push('Notification API missing');
    }

    // Check for inconsistent window properties
    if (window.outerWidth === 0 || window.outerHeight === 0) {
        indicators.push('Invalid window dimensions');
        detected = true;
    }

    // Check for automation-specific properties
    if ((window as any).domAutomation || (window as any).domAutomationController) {
        indicators.push('DOM automation detected');
        detected = true;
    }

    // Check for Cypress
    if ((window as any).Cypress || (window as any).__cypress) {
        indicators.push('Cypress testing framework detected');
        detected = true;
    }

    // Check for WebDriver BiDi
    if ((window as any).__webdriver_bidi) {
        indicators.push('WebDriver BiDi protocol detected');
        detected = true;
    }

    return { detected, indicators };
}

/**
 * Comprehensive Selenium and headless detection with stealth bot detection
 */
export function detectSeleniumAndHeadless(): SeleniumDetection {
    const detectionMethods: string[] = [];

    // Core detection
    const headless = detectHeadlessChrome();
    const selenium = detectSelenium();
    const phantomjs = detectPhantomJS();
    const other = detectOtherAutomation();

    // Advanced stealth detection
    const webdriverTampering = detectWebdriverTampering();
    const chromeDriverArtifacts = detectChromeDriverArtifacts();
    const errorStack = detectErrorStackAnomalies();
    const automationControlled = detectAutomationControlledFeatures();
    const canvasAnomalies = detectCanvasAnomalies();
    const webglAnomalies = detectWebGLAnomalies();

    // Track which methods found something
    if (headless.detected) detectionMethods.push('Headless Browser Detection');
    if (selenium.detected) detectionMethods.push('Selenium Framework Detection');
    if (phantomjs.detected) detectionMethods.push('PhantomJS Detection');
    if (other.detected) detectionMethods.push('General Automation Detection');
    if (webdriverTampering.detected) detectionMethods.push('WebDriver Tampering Detection');
    if (chromeDriverArtifacts.detected) detectionMethods.push('ChromeDriver Artifact Scanner');
    if (errorStack.detected) detectionMethods.push('Error Stack Analysis');
    if (automationControlled.detected) detectionMethods.push('Automation Feature Detection');
    if (canvasAnomalies.detected) detectionMethods.push('Canvas Rendering Analysis');
    if (webglAnomalies.detected) detectionMethods.push('WebGL Renderer Analysis');

    const allIndicators = [
        ...headless.indicators,
        ...selenium.indicators,
        ...phantomjs.indicators,
        ...other.indicators,
        ...webdriverTampering.indicators,
        ...chromeDriverArtifacts.indicators,
        ...errorStack.indicators,
        ...automationControlled.indicators,
        ...canvasAnomalies.indicators,
        ...webglAnomalies.indicators
    ];

    // Determine if stealth bot (trying to hide but still detected)
    const isStealthBot = webdriverTampering.detected ||
        chromeDriverArtifacts.detected ||
        errorStack.detected;

    const isAutomated = headless.detected ||
        selenium.detected ||
        phantomjs.detected ||
        other.detected ||
        isStealthBot;

    // Calculate risk score with weighted detection methods
    let riskScore = 0;

    // High-confidence detections
    if (selenium.detected) riskScore += 35;
    if (webdriverTampering.detected) riskScore += 30; // Stealth attempt is very suspicious
    if (chromeDriverArtifacts.detected) riskScore += 25;
    if (errorStack.detected) riskScore += 25;

    // Medium-confidence detections
    if (headless.detected) riskScore += 20;
    if (webglAnomalies.detected) riskScore += 15;
    if (automationControlled.detected) riskScore += 15;

    // Lower-confidence detections
    if (phantomjs.detected) riskScore += 15;
    if (canvasAnomalies.detected) riskScore += 10;
    if (other.detected) riskScore += 10;

    // Bonus for stealth attempt (trying to hide is extra suspicious)
    if (isStealthBot) riskScore += 15;

    riskScore = Math.min(riskScore, 100);

    return {
        isHeadless: headless.detected || webglAnomalies.detected,
        isSelenium: selenium.detected || webdriverTampering.detected || chromeDriverArtifacts.detected,
        isPhantomJS: phantomjs.detected,
        isAutomated,
        isStealthBot,
        detectedIndicators: allIndicators,
        riskScore,
        detectionMethods
    };
}
