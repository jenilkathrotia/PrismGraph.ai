import { generateCompletion } from './provider';
import { ExtractionResult } from '../types';

const EXTRACTION_SYSTEM_PROMPT = `You are a research paper analysis engine for PrismGraph.ai (powered by RocketRide AI).
Your task is to extract structured knowledge from research paper text.

Extract the following entities and relationships:
- Paper metadata (title, abstract, year, summary)
- Authors with affiliations
- Topics and research areas
- Methods and techniques used
- Claims (findings, hypotheses, conclusions, limitations) with confidence scores
- Datasets evaluated on
- Keywords
- Cited paper titles

Return ONLY valid JSON matching this exact schema:
{
  "paper": { "title": string, "abstract": string, "year": number, "summary": string },
  "authors": [{ "name": string, "affiliation": string }],
  "topics": [{ "name": string }],
  "methods": [{ "name": string, "description": string }],
  "claims": [{ "text": string, "type": "finding"|"hypothesis"|"conclusion"|"limitation", "confidence": number }],
  "datasets": [{ "name": string, "description": string }],
  "keywords": [string],
  "citations": [string]
}

Be thorough but accurate. Only extract what is explicitly stated or strongly implied in the text.
Assign confidence scores between 0.5 and 1.0 based on how definitive the claim is.`;

export async function extractFromPDF(text: string): Promise<ExtractionResult> {
  // Truncate very long texts to stay within token limits
  const truncatedText = text.slice(0, 15000);

  const response = await generateCompletion(
    EXTRACTION_SYSTEM_PROMPT,
    `Extract structured knowledge from this research paper text:\n\n${truncatedText}`,
    { json: true, temperature: 0.2, maxTokens: 4000 }
  );

  try {
    const parsed = JSON.parse(response);
    return {
      paper: {
        title: parsed.paper?.title || 'Untitled Paper',
        abstract: parsed.paper?.abstract || '',
        year: parsed.paper?.year || new Date().getFullYear(),
        summary: parsed.paper?.summary || '',
      },
      authors: (parsed.authors || []).map((a: { name: string; affiliation?: string }) => ({
        name: a.name || 'Unknown Author',
        affiliation: a.affiliation,
      })),
      topics: (parsed.topics || []).map((t: { name: string }) => ({ name: t.name })),
      methods: (parsed.methods || []).map((m: { name: string; description?: string }) => ({
        name: m.name,
        description: m.description,
      })),
      claims: (parsed.claims || []).map((c: { text: string; type: string; confidence?: number }) => ({
        text: c.text,
        type: c.type as 'finding' | 'hypothesis' | 'conclusion' | 'limitation',
        confidence: c.confidence || 0.7,
      })),
      datasets: (parsed.datasets || []).map((d: { name: string; description?: string }) => ({
        name: d.name,
        description: d.description,
      })),
      keywords: parsed.keywords || [],
      citations: parsed.citations || [],
    };
  } catch {
    console.error('Failed to parse extraction response');
    return {
      paper: { title: 'Untitled Paper', abstract: text.slice(0, 500), year: new Date().getFullYear() },
      authors: [],
      topics: [],
      methods: [],
      claims: [],
      datasets: [],
      keywords: [],
      citations: [],
    };
  }
}
