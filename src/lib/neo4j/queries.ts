import { runQuery, toPlainObject } from './driver';
import { GraphData, GraphNodeData, GraphEdgeData } from '../types';

// ============================================================
// Graph Creation
// ============================================================

export async function createPaperWithRelations(data: {
  paper: { id: string; title: string; abstract: string; year: number; summary?: string; doi?: string };
  authors: { id: string; name: string; affiliation?: string }[];
  topics: { id: string; name: string }[];
  methods: { id: string; name: string; description?: string }[];
  claims: { id: string; text: string; type: string; confidence?: number }[];
  datasets: { id: string; name: string; description?: string }[];
  venue?: { id: string; name: string; type: string };
  keywords: { id: string; term: string }[];
  citations: string[];
  clusterId?: string;
}): Promise<void> {
  // Create paper node
  await runQuery(
    `MERGE (p:Paper {id: $id})
     SET p.title = $title, p.abstract = $abstract, p.year = $year,
         p.summary = $summary, p.doi = $doi, p.createdAt = datetime()`,
    { id: data.paper.id, title: data.paper.title, abstract: data.paper.abstract, year: data.paper.year, summary: data.paper.summary || '', doi: data.paper.doi || '' }
  );

  // Create authors and AUTHORED relationships
  for (const author of data.authors) {
    await runQuery(
      `MERGE (a:Author {id: $aid})
       SET a.name = $name, a.affiliation = $affiliation
       WITH a
       MATCH (p:Paper {id: $pid})
       MERGE (a)-[:AUTHORED]->(p)`,
      { aid: author.id, name: author.name, affiliation: author.affiliation || '', pid: data.paper.id }
    );

    // Create institution if affiliation exists
    if (author.affiliation) {
      const instId = `inst_${author.affiliation.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      await runQuery(
        `MERGE (i:Institution {id: $iid})
         SET i.name = $name
         WITH i
         MATCH (a:Author {id: $aid})
         MERGE (a)-[:AFFILIATED_WITH]->(i)`,
        { iid: instId, name: author.affiliation, aid: author.id }
      );
    }
  }

  // Create topics and MENTIONS_TOPIC relationships
  for (const topic of data.topics) {
    await runQuery(
      `MERGE (t:Topic {id: $tid})
       SET t.name = $name
       WITH t
       MATCH (p:Paper {id: $pid})
       MERGE (p)-[:MENTIONS_TOPIC]->(t)`,
      { tid: topic.id, name: topic.name, pid: data.paper.id }
    );
  }

  // Create methods and USES_METHOD relationships
  for (const method of data.methods) {
    await runQuery(
      `MERGE (m:Method {id: $mid})
       SET m.name = $name, m.description = $description
       WITH m
       MATCH (p:Paper {id: $pid})
       MERGE (p)-[:USES_METHOD]->(m)`,
      { mid: method.id, name: method.name, description: method.description || '', pid: data.paper.id }
    );
  }

  // Create claims and MAKES_CLAIM relationships
  for (const claim of data.claims) {
    await runQuery(
      `MERGE (c:Claim {id: $cid})
       SET c.text = $text, c.type = $type, c.confidence = $confidence
       WITH c
       MATCH (p:Paper {id: $pid})
       MERGE (p)-[:MAKES_CLAIM]->(c)`,
      { cid: claim.id, text: claim.text, type: claim.type, confidence: claim.confidence || 0.8, pid: data.paper.id }
    );
  }

  // Create datasets and EVALUATES_ON relationships
  for (const dataset of data.datasets) {
    await runQuery(
      `MERGE (d:Dataset {id: $did})
       SET d.name = $name, d.description = $description
       WITH d
       MATCH (p:Paper {id: $pid})
       MERGE (p)-[:EVALUATES_ON]->(d)`,
      { did: dataset.id, name: dataset.name, description: dataset.description || '', pid: data.paper.id }
    );
  }

  // Create venue and PUBLISHED_IN relationship
  if (data.venue) {
    await runQuery(
      `MERGE (v:Venue {id: $vid})
       SET v.name = $name, v.type = $type
       WITH v
       MATCH (p:Paper {id: $pid})
       MERGE (p)-[:PUBLISHED_IN]->(v)`,
      { vid: data.venue.id, name: data.venue.name, type: data.venue.type, pid: data.paper.id }
    );
  }

  // Create keywords and MENTIONS_KEYWORD relationships
  for (const keyword of data.keywords) {
    await runQuery(
      `MERGE (k:Keyword {id: $kid})
       SET k.term = $term
       WITH k
       MATCH (p:Paper {id: $pid})
       MERGE (p)-[:MENTIONS_KEYWORD]->(k)`,
      { kid: keyword.id, term: keyword.term, pid: data.paper.id }
    );
  }

  // Create citation relationships
  for (const citedTitle of data.citations) {
    await runQuery(
      `MATCH (p1:Paper {id: $pid})
       MATCH (p2:Paper) WHERE toLower(p2.title) CONTAINS toLower($citedTitle)
       MERGE (p1)-[:CITES]->(p2)`,
      { pid: data.paper.id, citedTitle }
    );
  }

  // Assign to cluster
  if (data.clusterId) {
    await runQuery(
      `MATCH (p:Paper {id: $pid})
       MATCH (cl:Cluster {id: $cid})
       MERGE (p)-[:BELONGS_TO_CLUSTER]->(cl)`,
      { pid: data.paper.id, cid: data.clusterId }
    );
  }
}

// ============================================================
// Graph Retrieval
// ============================================================

export async function getFullGraph(): Promise<GraphData> {
  const nodesResult = await runQuery<{ id: string; labels: string[]; props: Record<string, unknown> }>(
    `MATCH (n)
     WHERE n:Paper OR n:Author OR n:Topic OR n:Method OR n:Claim OR n:Dataset OR n:Venue OR n:Institution OR n:Cluster OR n:Keyword
     RETURN n.id AS id, labels(n) AS labels, properties(n) AS props
     LIMIT 500`
  );

  const edgesResult = await runQuery<{ source: string; target: string; type: string; props: Record<string, unknown> }>(
    `MATCH (a)-[r]->(b)
     WHERE (a:Paper OR a:Author OR a:Topic OR a:Method OR a:Claim OR a:Dataset OR a:Venue OR a:Institution OR a:Cluster OR a:Keyword)
     AND (b:Paper OR b:Author OR b:Topic OR b:Method OR b:Claim OR b:Dataset OR b:Venue OR b:Institution OR b:Cluster OR b:Keyword)
     RETURN a.id AS source, b.id AS target, type(r) AS type, properties(r) AS props
     LIMIT 1000`
  );

  const nodes: GraphNodeData[] = nodesResult.map((n) => ({
    id: n.id,
    label: (toPlainObject(n.props) as Record<string, string>).title || (toPlainObject(n.props) as Record<string, string>).name || (toPlainObject(n.props) as Record<string, string>).term || (toPlainObject(n.props) as Record<string, string>).text?.slice(0, 50) || n.id,
    type: mapLabelToType(n.labels),
    properties: toPlainObject(n.props) as Record<string, unknown>,
  }));

  const edges: GraphEdgeData[] = edgesResult.map((e, i) => ({
    id: `edge_${i}`,
    source: e.source,
    target: e.target,
    type: e.type,
    properties: toPlainObject(e.props) as Record<string, unknown>,
  }));

  return { nodes, edges };
}

export async function getNodeNeighborhood(nodeId: string, depth: number = 1): Promise<GraphData> {
  const nodesResult = await runQuery<{ id: string; labels: string[]; props: Record<string, unknown> }>(
    `MATCH (center {id: $nodeId})
     CALL {
       WITH center
       MATCH (center)-[*1..${Math.min(depth, 3)}]-(neighbor)
       RETURN neighbor
     }
     WITH collect(DISTINCT neighbor) + [center] AS allNodes
     UNWIND allNodes AS n
     RETURN DISTINCT n.id AS id, labels(n) AS labels, properties(n) AS props`,
    { nodeId }
  );

  const nodeIds = nodesResult.map(n => n.id);
  
  const edgesResult = await runQuery<{ source: string; target: string; type: string; props: Record<string, unknown> }>(
    `MATCH (a)-[r]->(b)
     WHERE a.id IN $nodeIds AND b.id IN $nodeIds
     RETURN a.id AS source, b.id AS target, type(r) AS type, properties(r) AS props`,
    { nodeIds }
  );

  const nodes: GraphNodeData[] = nodesResult.map((n) => ({
    id: n.id,
    label: (toPlainObject(n.props) as Record<string, string>).title || (toPlainObject(n.props) as Record<string, string>).name || (toPlainObject(n.props) as Record<string, string>).term || (toPlainObject(n.props) as Record<string, string>).text?.slice(0, 50) || n.id,
    type: mapLabelToType(n.labels),
    properties: toPlainObject(n.props) as Record<string, unknown>,
  }));

  const edges: GraphEdgeData[] = edgesResult.map((e, i) => ({
    id: `edge_${i}`,
    source: e.source,
    target: e.target,
    type: e.type,
    properties: toPlainObject(e.props) as Record<string, unknown>,
  }));

  return { nodes, edges };
}

export async function searchGraph(query: string): Promise<GraphNodeData[]> {
  const results = await runQuery<{ id: string; labels: string[]; props: Record<string, unknown>; score: number }>(
    `MATCH (n)
     WHERE (n:Paper AND (toLower(n.title) CONTAINS toLower($query) OR toLower(n.abstract) CONTAINS toLower($query)))
        OR (n:Author AND toLower(n.name) CONTAINS toLower($query))
        OR (n:Topic AND toLower(n.name) CONTAINS toLower($query))
        OR (n:Method AND toLower(n.name) CONTAINS toLower($query))
        OR (n:Keyword AND toLower(n.term) CONTAINS toLower($query))
        OR (n:Claim AND toLower(n.text) CONTAINS toLower($query))
     RETURN n.id AS id, labels(n) AS labels, properties(n) AS props, 1 AS score
     LIMIT 20`,
    { query }
  );

  return results.map((n) => ({
    id: n.id,
    label: (toPlainObject(n.props) as Record<string, string>).title || (toPlainObject(n.props) as Record<string, string>).name || (toPlainObject(n.props) as Record<string, string>).term || n.id,
    type: mapLabelToType(n.labels),
    properties: toPlainObject(n.props) as Record<string, unknown>,
  }));
}

export async function getClusters(): Promise<{ cluster: Record<string, unknown>; papers: Record<string, unknown>[] }[]> {
  const results = await runQuery<{ cluster: Record<string, unknown>; papers: Record<string, unknown>[] }>(
    `MATCH (cl:Cluster)
     OPTIONAL MATCH (p:Paper)-[:BELONGS_TO_CLUSTER]->(cl)
     WITH cl, collect(properties(p)) AS papers
     RETURN properties(cl) AS cluster, papers
     ORDER BY size(papers) DESC`
  );
  return results.map(r => ({
    cluster: toPlainObject(r.cluster) as Record<string, unknown>,
    papers: (toPlainObject(r.papers) as Record<string, unknown>[]) || [],
  }));
}

export async function getContradictions(): Promise<{ claim1: Record<string, unknown>; claim2: Record<string, unknown>; paper1: string; paper2: string }[]> {
  const results = await runQuery<{ claim1: Record<string, unknown>; claim2: Record<string, unknown>; paper1: string; paper2: string }>(
    `MATCH (c1:Claim)-[:CONTRADICTS]->(c2:Claim)
     MATCH (p1:Paper)-[:MAKES_CLAIM]->(c1)
     MATCH (p2:Paper)-[:MAKES_CLAIM]->(c2)
     RETURN properties(c1) AS claim1, properties(c2) AS claim2, p1.title AS paper1, p2.title AS paper2`
  );
  return results.map(r => ({
    claim1: toPlainObject(r.claim1) as Record<string, unknown>,
    claim2: toPlainObject(r.claim2) as Record<string, unknown>,
    paper1: r.paper1,
    paper2: r.paper2,
  }));
}

export async function getAuthorInfluence(): Promise<{ author: string; paperCount: number; citationCount: number; topics: string[] }[]> {
  const results = await runQuery<{ author: string; paperCount: number; citationCount: number; topics: string[] }>(
    `MATCH (a:Author)-[:AUTHORED]->(p:Paper)
     OPTIONAL MATCH (p2:Paper)-[:CITES]->(p)
     OPTIONAL MATCH (p)-[:MENTIONS_TOPIC]->(t:Topic)
     WITH a, count(DISTINCT p) AS paperCount, count(DISTINCT p2) AS citationCount, collect(DISTINCT t.name) AS topics
     RETURN a.name AS author, paperCount, citationCount, topics
     ORDER BY citationCount DESC, paperCount DESC
     LIMIT 10`
  );
  return results;
}

export async function getGraphStats(): Promise<{ nodeCount: number; edgeCount: number; paperCount: number; authorCount: number; topicCount: number }> {
  const result = await runQuery<{ nodeCount: number; edgeCount: number; paperCount: number; authorCount: number; topicCount: number }>(
    `MATCH (n) WITH count(n) AS nodeCount
     OPTIONAL MATCH ()-[r]->() WITH nodeCount, count(r) AS edgeCount
     OPTIONAL MATCH (p:Paper) WITH nodeCount, edgeCount, count(p) AS paperCount
     OPTIONAL MATCH (a:Author) WITH nodeCount, edgeCount, paperCount, count(a) AS authorCount
     OPTIONAL MATCH (t:Topic) 
     RETURN nodeCount, edgeCount, paperCount, authorCount, count(t) AS topicCount`
  );
  return result[0] || { nodeCount: 0, edgeCount: 0, paperCount: 0, authorCount: 0, topicCount: 0 };
}

export async function getRelevantContext(question: string): Promise<string> {
  // Get relevant papers, claims, and evidence for the question
  const papers = await runQuery<{ title: string; abstract: string; summary: string }>(
    `MATCH (p:Paper)
     WHERE toLower(p.title) CONTAINS toLower($query) 
        OR toLower(p.abstract) CONTAINS toLower($query)
     RETURN p.title AS title, p.abstract AS abstract, p.summary AS summary
     LIMIT 5`,
    { query: question.split(' ').slice(0, 3).join(' ') }
  );

  const claims = await runQuery<{ text: string; paperTitle: string; type: string }>(
    `MATCH (p:Paper)-[:MAKES_CLAIM]->(c:Claim)
     RETURN c.text AS text, p.title AS paperTitle, c.type AS type
     LIMIT 20`
  );

  const methods = await runQuery<{ name: string; papers: string[] }>(
    `MATCH (p:Paper)-[:USES_METHOD]->(m:Method)
     WITH m, collect(p.title) AS papers
     RETURN m.name AS name, papers
     LIMIT 10`
  );

  const topics = await runQuery<{ name: string; papers: string[] }>(
    `MATCH (p:Paper)-[:MENTIONS_TOPIC]->(t:Topic)
     WITH t, collect(p.title) AS papers
     RETURN t.name AS name, papers
     LIMIT 10`
  );

  const contradictions = await getContradictions();

  let context = '=== PAPERS ===\n';
  papers.forEach(p => {
    context += `Title: ${p.title}\nAbstract: ${p.abstract}\nSummary: ${p.summary}\n\n`;
  });

  context += '\n=== CLAIMS ===\n';
  claims.forEach(c => {
    context += `[${c.type}] "${c.text}" (from: ${c.paperTitle})\n`;
  });

  context += '\n=== METHODS ===\n';
  methods.forEach(m => {
    context += `${m.name}: used by ${(m.papers || []).join(', ')}\n`;
  });

  context += '\n=== TOPICS ===\n';
  topics.forEach(t => {
    context += `${t.name}: covered by ${(t.papers || []).join(', ')}\n`;
  });

  if (contradictions.length > 0) {
    context += '\n=== CONTRADICTIONS ===\n';
    contradictions.forEach(c => {
      context += `"${(c.claim1 as Record<string, string>).text}" (${c.paper1}) CONTRADICTS "${(c.claim2 as Record<string, string>).text}" (${c.paper2})\n`;
    });
  }

  return context;
}

export async function clearDatabase(): Promise<void> {
  await runQuery('MATCH (n) DETACH DELETE n');
}

// ============================================================
// Helpers
// ============================================================

function mapLabelToType(labels: string[]): GraphNodeData['type'] {
  const labelMap: Record<string, GraphNodeData['type']> = {
    Paper: 'paper',
    Author: 'author',
    Topic: 'topic',
    Method: 'method',
    Claim: 'claim',
    Dataset: 'dataset',
    Venue: 'venue',
    Institution: 'institution',
    Cluster: 'cluster',
    Keyword: 'keyword',
  };
  for (const label of labels) {
    if (labelMap[label]) return labelMap[label];
  }
  return 'paper';
}
