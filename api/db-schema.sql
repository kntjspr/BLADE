-- Create sessions table for fingerprint-based session tracking
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    canvas_fingerprint TEXT NOT NULL,
    webgl_fingerprint TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    last_seen BIGINT NOT NULL,
    visit_count INTEGER DEFAULT 1,
    notes TEXT
);

-- Create indexes for faster fingerprint lookups
CREATE INDEX IF NOT EXISTS idx_canvas_fingerprint ON sessions(canvas_fingerprint);
CREATE INDEX IF NOT EXISTS idx_webgl_fingerprint ON sessions(webgl_fingerprint);
CREATE INDEX IF NOT EXISTS idx_last_seen ON sessions(last_seen DESC);
