import { BrowserProfile } from "../types";

export const getCanvasFingerprint = async (): Promise<string> => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unknown';

    canvas.width = 400;
    canvas.height = 200;

    // Text with shadow and specific positioning
    ctx.textBaseline = "top";
    ctx.font = "16px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("BLADE", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("BLADE", 4, 17);

    // Add more complex rendering for better fingerprinting
    ctx.font = "12px 'Courier New'";
    ctx.fillStyle = "#ff0000";
    ctx.fillText("Browser Fingerprint", 10, 40);

    // Composite operation to test blending
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgb(255,0,255)";
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    // Add gradient for more variation
    const gradient = ctx.createLinearGradient(0, 0, 200, 0);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.5, "green");
    gradient.addColorStop(1, "blue");
    ctx.fillStyle = gradient;
    ctx.fillRect(200, 50, 150, 100);

    // Get canvas data
    const dataURL = canvas.toDataURL();

    // Use SHA-256 for longer, more secure hash
    const encoder = new TextEncoder();
    const data = encoder.encode(dataURL);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  } catch (e) {
    return 'error';
  }
};

export const getPublicIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return 'unknown';
  }
};

const testFonts = [
  'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New',
  'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
  'Trebuchet MS', 'Impact'
];

export const getInstalledFonts = (): string[] => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return [];

  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';

  const baselines: Record<string, number> = {};
  baseFonts.forEach(baseFont => {
    context.font = testSize + ' ' + baseFont;
    baselines[baseFont] = context.measureText(testString).width;
  });

  const detectedFonts: string[] = [];
  testFonts.forEach(font => {
    let detected = false;
    baseFonts.forEach(baseFont => {
      context.font = testSize + ' ' + font + ', ' + baseFont;
      const width = context.measureText(testString).width;
      if (width !== baselines[baseFont]) {
        detected = true;
      }
    });
    if (detected) {
      detectedFonts.push(font);
    }
  });

  return detectedFonts;
};

export const getBrowserProfile = async (): Promise<BrowserProfile> => {
  // Wait for fonts to load if needed, or run immediately
  await document.fonts.ready;

  const profile: BrowserProfile = {
    user_agent: navigator.userAgent,
    fonts: getInstalledFonts(),
    canvas_hash: await getCanvasFingerprint(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
  };
  return profile;
};