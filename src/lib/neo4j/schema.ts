import { runQuery } from './driver';

export async function initializeSchema(): Promise<void> {
  // Create constraints for unique IDs
  const constraints = [
    'CREATE CONSTRAINT paper_id IF NOT EXISTS FOR (p:Paper) REQUIRE p.id IS UNIQUE',
    'CREATE CONSTRAINT author_id IF NOT EXISTS FOR (a:Author) REQUIRE a.id IS UNIQUE',
    'CREATE CONSTRAINT topic_id IF NOT EXISTS FOR (t:Topic) REQUIRE t.id IS UNIQUE',
    'CREATE CONSTRAINT method_id IF NOT EXISTS FOR (m:Method) REQUIRE m.id IS UNIQUE',
    'CREATE CONSTRAINT claim_id IF NOT EXISTS FOR (c:Claim) REQUIRE c.id IS UNIQUE',
    'CREATE CONSTRAINT dataset_id IF NOT EXISTS FOR (d:Dataset) REQUIRE d.id IS UNIQUE',
    'CREATE CONSTRAINT venue_id IF NOT EXISTS FOR (v:Venue) REQUIRE v.id IS UNIQUE',
    'CREATE CONSTRAINT institution_id IF NOT EXISTS FOR (i:Institution) REQUIRE i.id IS UNIQUE',
    'CREATE CONSTRAINT cluster_id IF NOT EXISTS FOR (cl:Cluster) REQUIRE cl.id IS UNIQUE',
    'CREATE CONSTRAINT keyword_id IF NOT EXISTS FOR (k:Keyword) REQUIRE k.id IS UNIQUE',
  ];

  // Create indexes for search performance
  const indexes = [
    'CREATE INDEX paper_title IF NOT EXISTS FOR (p:Paper) ON (p.title)',
    'CREATE INDEX author_name IF NOT EXISTS FOR (a:Author) ON (a.name)',
    'CREATE INDEX topic_name IF NOT EXISTS FOR (t:Topic) ON (t.name)',
    'CREATE INDEX method_name IF NOT EXISTS FOR (m:Method) ON (m.name)',
    'CREATE INDEX keyword_term IF NOT EXISTS FOR (k:Keyword) ON (k.term)',
  ];

  for (const constraint of constraints) {
    try {
      await runQuery(constraint);
    } catch (e) {
      // Constraint may already exist
      console.log('Schema constraint:', (e as Error).message?.slice(0, 80));
    }
  }

  for (const index of indexes) {
    try {
      await runQuery(index);
    } catch (e) {
      console.log('Schema index:', (e as Error).message?.slice(0, 80));
    }
  }

  console.log('Neo4j schema initialized');
}
