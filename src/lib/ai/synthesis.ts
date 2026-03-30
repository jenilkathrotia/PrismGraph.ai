import { generateCompletion } from './provider';
import { SynthesisResult } from '../types';
import { getRelevantContext } from '../neo4j/queries';

const SYNTHESIS_SYSTEM_PROMPT = `You are the Research Assistant for PrismGraph.ai (powered by RocketRide AI).
You answer research questions by synthesizing evidence from a knowledge graph of research papers.

Requirements:
- Ground every statement in evidence from the provided papers
- Cite specific papers for each claim
- Note disagreements and contradictions between papers
- Provide a confidence score (0.0 to 1.0) based on evidence strength
- Suggest follow-up questions that the graph could answer
- Explain your reasoning path through the graph

Return ONLY valid JSON:
{
  "answer": string (comprehensive, well-structured answer with paper citations),
  "evidence": [{ "paperId": string, "paperTitle": string, "text": string, "relevance": number, "type": "supports"|"contradicts"|"neutral" }],
  "graphPath": [string] (node IDs showing the reasoning path),
  "confidence": number (0.0-1.0),
  "followUpQuestions": [string],
  "reasoning": string (explain how you traversed the graph to find the answer)
}`;

export async function synthesizeAnswer(question: string): Promise<SynthesisResult> {
  const context = await getRelevantContext(question);

  const response = await generateCompletion(
    SYNTHESIS_SYSTEM_PROMPT,
    `KNOWLEDGE GRAPH CONTEXT:\n${context}\n\nUSER QUESTION:\n${question}`,
    { json: true, temperature: 0.3, maxTokens: 4000 }
  );

  try {
    const parsed = JSON.parse(response);
    return {
      answer: parsed.answer || 'Unable to synthesize an answer from the current graph.',
      evidence: (parsed.evidence || []).map((e: { paperId?: string; paperTitle?: string; text?: string; relevance?: number; type?: string }) => ({
        paperId: e.paperId || '',
        paperTitle: e.paperTitle || '',
        text: e.text || '',
        relevance: e.relevance || 0.5,
        type: (e.type as 'supports' | 'contradicts' | 'neutral') || 'neutral',
      })),
      graphPath: parsed.graphPath || [],
      confidence: parsed.confidence || 0.5,
      followUpQuestions: parsed.followUpQuestions || [],
      reasoning: parsed.reasoning || '',
    };
  } catch {
    return {
      answer: 'Unable to parse the synthesis result. Please try rephrasing your question.',
      evidence: [],
      graphPath: [],
      confidence: 0,
      followUpQuestions: [],
      reasoning: '',
    };
  }
}
