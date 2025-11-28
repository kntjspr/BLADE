// Test script to verify Neon database connection
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = "postgresql://neondb_owner:npg_Dq47tzpbjmwW@ep-quiet-waterfall-afaa8hps-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require";

async function testConnection() {
    console.log('Testing Neon database connection...');

    try {
        const sql = neon(DATABASE_URL);

        // Test 1: Simple query
        console.log('\n1. Testing basic query...');
        const result = await sql`SELECT NOW() as current_time`;
        console.log('✅ Connection successful!');
        console.log('Current time:', result[0].current_time);

        // Test 2: Create table
        console.log('\n2. Creating sessions table...');
        await sql`
            CREATE TABLE IF NOT EXISTS sessions (
                id VARCHAR(255) PRIMARY KEY,
                label VARCHAR(255) NOT NULL,
                canvas_fingerprint TEXT NOT NULL,
                webgl_fingerprint TEXT NOT NULL,
                created_at BIGINT NOT NULL,
                last_seen BIGINT NOT NULL,
                visit_count INTEGER DEFAULT 1,
                notes TEXT
            )
        `;
        console.log('✅ Table created successfully!');

        // Test 3: Create indexes
        console.log('\n3. Creating indexes...');
        await sql`CREATE INDEX IF NOT EXISTS idx_canvas_fingerprint ON sessions(canvas_fingerprint)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_webgl_fingerprint ON sessions(webgl_fingerprint)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_last_seen ON sessions(last_seen DESC)`;
        console.log('✅ Indexes created successfully!');

        // Test 4: Insert test session
        console.log('\n4. Inserting test session...');
        const testId = `test_${Date.now()}`;
        await sql`
            INSERT INTO sessions (
                id, label, canvas_fingerprint, webgl_fingerprint,
                created_at, last_seen, visit_count, notes
            ) VALUES (
                ${testId}, 'Test Session', 'test_canvas_hash', 'test_webgl_hash',
                ${Date.now()}, ${Date.now()}, 1, 'Test from connection script'
            )
        `;
        console.log('✅ Test session inserted!');

        // Test 5: Query sessions
        console.log('\n5. Querying sessions...');
        const sessions = await sql`SELECT * FROM sessions ORDER BY last_seen DESC LIMIT 5`;
        console.log(`✅ Found ${sessions.length} session(s):`);
        sessions.forEach(s => {
            console.log(`  - ${s.label} (ID: ${s.id})`);
        });

        // Test 6: Delete test session
        console.log('\n6. Cleaning up test session...');
        await sql`DELETE FROM sessions WHERE id = ${testId}`;
        console.log('✅ Test session deleted!');

        console.log('\n✅ All tests passed! Database is working correctly.');

    } catch (error) {
        console.error('\n❌ Database connection failed!');
        console.error('Error:', error);

        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }

        process.exit(1);
    }
}

testConnection();
