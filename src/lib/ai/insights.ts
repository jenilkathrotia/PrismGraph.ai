import { generateCompletion } from './provider';
import { InsightResult } from '../types';
import { getAuthorInfluence, getContradictions, getClusters, getGraphStats } from '../neo4j/queries';

const INSIGHTS_SYSTEM_PROMPT = `You are the Insight Engine for ResearchGraph AI (powered by RocketRide AI).
Analyze knowledge graph statistics and generate actionable research insights.

Insight types: influential_author, emerging_theme, contradiction, bridge_connection, common_method, foundational_paper, underexplored, dataset_reuse

Return ONLY valid JSON:
{
  "insights": [{
    "type": string,
    "title": string (concise, compelling),
    "description": string (2-3 sentences),
    "relatedNodes": [string] (node IDs),
    "score": number (0.0-1.0, importance)
  }]
}

Generate 5-8 diverse insights. Prioritize by impact and novelty.`;

export async function generateInsights(): Promise<InsightResult[]> {
  const [authors, contradictions, clusters, stats] = await Promise.all([
    getAuthorInfluence(),
    getContradictions(),
    getClusters(),
    getGraphStats(),
  ]);

  const contextBlock = `
GRAPH STATISTICS:
- Total nodes: ${stats.nodeCount}
- Total edges: ${stats.edgeCount}
- Papers: ${stats.paperCount}
- Authors: ${stats.authorCount}
- Topics: ${stats.topicCount}

TOP AUTHORS BY INFLUENCE:
${authors.map(a => `- ${a.author}: ${a.paperCount} papers, ${a.citationCount} citations, topics: ${(a.topics || []).join(', ')}`).join('\n')}

TOPIC CLUSTERS:
${clusters.map(c => `- ${(c.cluster as Record<string, string>).label}: ${(c.papers || []).length} papers - ${(c.cluster as Record<string, string>).summary || 'No summary'}`).join('\n')}

CONTRADICTIONS:
${contradictions.map(c => `- "${(c.claim1 as Record<string, string>).text}" (${c.paper1}) vs "${(c.claim2 as Record<string, string>).text}" (${c.paper2})`).join('\n') || 'None detected'}`;

  const response = await generateCompletion(
    INSIGHTS_SYSTEM_PROMPT,
    contextBlock,
    { json: true, temperature: 0.4, maxTokens: 3000 }
  );

  try {
    const parsed = JSON.parse(response);
    return (parsed.insights || []).map((i: InsightResult) => ({
      type: i.type,
      title: i.title,
      description: i.description,
      relatedNodes: i.relatedNodes || [],
      score: i.score || 0.5,
    }));
  } catch {
    return [];
  }
}
