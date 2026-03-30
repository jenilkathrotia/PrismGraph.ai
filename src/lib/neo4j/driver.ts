import neo4j, { Driver, Integer } from 'neo4j-driver';

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'researchgraph123';

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD),
      {
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 10000,
        connectionTimeout: 5000,
      }
    );
  }
  return driver;
}

export async function verifyConnectivity(): Promise<boolean> {
  try {
    const d = getDriver();
    await d.verifyConnectivity();
    return true;
  } catch (error) {
    console.error('Neo4j connectivity check failed:', error);
    return false;
  }
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

// Helper to run a single query with auto-session management
export async function runQuery<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const d = getDriver();
  const { records } = await d.executeQuery(cypher, params);
  return records.map((record) => {
    const obj: Record<string, unknown> = {};
    record.keys.forEach((key) => {
      const val = record.get(key);
      obj[key as string] = neo4j.isInt(val) ? val.toNumber() : val;
    });
    return obj as T;
  });
}

// Helper to convert Neo4j integers in nested objects
export function toPlainObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (neo4j.isInt(obj)) return (obj as Integer).toNumber();
  if (Array.isArray(obj)) return obj.map(toPlainObject);
  if (typeof obj === 'object') {
    const plain: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      plain[key] = toPlainObject(value);
    }
    return plain;
  }
  return obj;
}
