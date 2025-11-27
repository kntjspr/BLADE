export interface WebGLFingerprint {
    hash: string;
    vendor: string;
    renderer: string;
    version: string;
    shadingLanguageVersion: string;
    supported: boolean;
    extensions: string[];
}

/**
 * Simple hash function for strings
 */
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Get WebGL fingerprint data
 */
export function getWebGLFingerprint(): WebGLFingerprint {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;

    if (!gl) {
        return {
            hash: 'webgl-not-supported',
            vendor: 'N/A',
            renderer: 'N/A',
            version: 'N/A',
            shadingLanguageVersion: 'N/A',
            supported: false,
            extensions: []
        };
    }

    // Get debug info
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);

    // Get version info
    const version = gl.getParameter(gl.VERSION);
    const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);

    // Get supported extensions
    const extensions = gl.getSupportedExtensions() || [];

    // Get additional parameters for fingerprinting
    const params = [
        gl.getParameter(gl.MAX_TEXTURE_SIZE),
        gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
        gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
        gl.getParameter(gl.MAX_VARYING_VECTORS),
        gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
        gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
        gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
        gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
        gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
        gl.getParameter(gl.MAX_VIEWPORT_DIMS),
        gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
        gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)
    ];

    // Create fingerprint string
    const fingerprintString = [
        vendor,
        renderer,
        version,
        shadingLanguageVersion,
        ...extensions.slice(0, 10), // Limit extensions to avoid too long string
        ...params.map(p => JSON.stringify(p))
    ].join('|');

    const hash = simpleHash(fingerprintString);

    return {
        hash,
        vendor: vendor as string,
        renderer: renderer as string,
        version: version as string,
        shadingLanguageVersion: shadingLanguageVersion as string,
        supported: true,
        extensions: extensions.slice(0, 20) // Return first 20 extensions
    };
}

/**
 * Draw on canvas for additional fingerprinting
 */
export function getWebGLCanvasFingerprint(): string {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;

    if (!gl) return 'webgl-not-supported';

    // Create a simple shader program
    const vertexShaderSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

    const fragmentShaderSource = `
    precision mediump float;
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Draw a triangle
    const vertices = new Float32Array([
        -0.5, -0.5,
        0.5, -0.5,
        0.0, 0.5
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Get canvas data
    const dataURL = canvas.toDataURL();
    return simpleHash(dataURL);
}
