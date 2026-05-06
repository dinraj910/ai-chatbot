/**
 * Astra DB Client — Singleton Connection
 * Uses the official @datastax/astra-db-ts Data API client (v2.x).
 *
 * API reference:
 *   client.db(endpoint, { token, keyspace? })
 *   → keyspace defaults to 'default_keyspace' if omitted
 */

const { DataAPIClient } = require('@datastax/astra-db-ts');

let db = null;

/**
 * Returns the connected Astra DB instance.
 * Safe to call multiple times — only connects once (lazy singleton).
 * Returns null if credentials are missing, so the rest of the app degrades gracefully.
 */
const getDb = () => {
  if (db) return db;

  const token    = process.env.ASTRA_DB_TOKEN;
  const endpoint = process.env.ASTRA_DB_ENDPOINT;
  const keyspace = process.env.ASTRA_DB_KEYSPACE || 'default_keyspace';

  // Detect placeholder values — treat as "not configured"
  if (
    !token || !endpoint ||
    token.includes('REPLACE_WITH') ||
    endpoint.includes('REPLACE_WITH')
  ) {
    console.warn(
      '[AstraDB] ⚠️  Credentials not set.\n' +
      '          Open backend/.env and fill in ASTRA_DB_TOKEN and ASTRA_DB_ENDPOINT.\n' +
      '          DB features are disabled until then.'
    );
    return null;
  }

  try {
    const client = new DataAPIClient(token);
    // Pass keyspace in the db() options — this sets the default namespace for all operations
    db = client.db(endpoint, { keyspace });
    console.log(`[AstraDB] ✅ Connected → keyspace: ${keyspace}`);
  } catch (err) {
    console.error('[AstraDB] ❌ Connection failed:', err.message);
    return null;
  }

  return db;
};

const isDbReady = () => !!db;

module.exports = { getDb, isDbReady };
