export interface SeleniumDetection {
    isHeadless: boolean;
    isSelenium: boolean;
    isPhantomJS: boolean;
    isAutomated: boolean;
    detectedIndicators: string[];
    riskScore: number; // 0-100
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

    // Check for webdriver
    if (navigator.webdriver) {
        indicators.push('navigator.webdriver is true');
        detected = true;
    }

    // Check for chrome object inconsistencies
    if ((window as any).chrome) {
        if (!(window as any).chrome.runtime) {
            indicators.push('chrome.runtime is missing');
            detected = true;
        }
    }

    // Check for missing languages
    if (navigator.languages.length === 0) {
        indicators.push('No languages detected');
        detected = true;
    }

    // Check for permissions API
    if (!(navigator as any).permissions) {
        indicators.push('Permissions API missing');
    }

    return { detected, indicators };
}

/**
 * Detect Selenium
 */
function detectSelenium(): { detected: boolean; indicators: string[] } {
    const indicators: string[] = [];
    let detected = false;

    // Check for webdriver property
    if (navigator.webdriver) {
        indicators.push('navigator.webdriver present');
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
        '__fxdriver_unwrapped'
    ];

    seleniumProps.forEach(prop => {
        if ((document as any)[prop] || (window as any)[prop]) {
            indicators.push(`${prop} detected`);
            detected = true;
        }
    });

    // Check for _Selenium_ or _selenium in window
    if ((window as any)._Selenium_IDE_Recorder || (window as any)._selenium) {
        indicators.push('Selenium IDE Recorder detected');
        detected = true;
    }

    // Check for callSelenium
    if ((window as any).callSelenium || (window as any)._WEBDRIVER_ELEM_CACHE) {
        indicators.push('Selenium call functions detected');
        detected = true;
    }

    // Check document properties
    if ((document as any).$cdc_asdjflasutopfhvcZLmcfl_ || (document as any).$chrome_asyncScriptInfo) {
        indicators.push('ChromeDriver properties detected');
        detected = true;
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

    // Check for missing battery API (might be privacy-related, not always automation)
    if (!(navigator as any).getBattery && !(navigator as any).battery) {
        // This is normal in many browsers now, so we don't mark as detected
        indicators.push('Battery API missing (normal in modern browsers)');
    }

    // Check for automation-specific properties
    if ((window as any).domAutomation || (window as any).domAutomationController) {
        indicators.push('DOM automation detected');
        detected = true;
    }

    return { detected, indicators };
}

/**
 * Comprehensive Selenium and headless detection
 */
export function detectSeleniumAndHeadless(): SeleniumDetection {
    const headless = detectHeadlessChrome();
    const selenium = detectSelenium();
    const phantomjs = detectPhantomJS();
    const other = detectOtherAutomation();

    const allIndicators = [
        ...headless.indicators,
        ...selenium.indicators,
        ...phantomjs.indicators,
        ...other.indicators
    ];

    const isAutomated = headless.detected || selenium.detected || phantomjs.detected || other.detected;

    // Calculate risk score
    let riskScore = 0;
    if (selenium.detected) riskScore += 40;
    if (headless.detected) riskScore += 30;
    if (phantomjs.detected) riskScore += 20;
    if (other.detected) riskScore += 10;
    riskScore = Math.min(riskScore, 100);

    return {
        isHeadless: headless.detected,
        isSelenium: selenium.detected,
        isPhantomJS: phantomjs.detected,
        isAutomated,
        detectedIndicators: allIndicators,
        riskScore
    };
}
