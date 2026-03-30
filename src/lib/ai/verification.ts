import { generateCompletion } from './provider';
import { VerificationResult, ConfidenceMode, SynthesisResult } from '../types';
import { getContradictions } from '../neo4j/queries';

const VERIFICATION_PROMPTS: Record<ConfidenceMode, string> = {
  fast: `You are a quick verification agent. Do a rapid check of the answer against the evidence.
Check each claim for basic support. Flag obvious contradictions. Score confidence.
Be efficient - this is a fast pass, not exhaustive. Return JSON.`,

  balanced: `You are a verification agent. Check the answer against the evidence carefully.
For each claim: verify it has supporting evidence, check for contradictions across papers,
assess evidence quality. Score confidence conservatively. Return JSON.`,

  strict: `You are a strict verification agent. Perform exhaustive claim-by-claim analysis.
For each claim: require explicit supporting evidence, check for contradictions across ALL papers,
assess evidence chain completeness, identify any unsupported assertions.
Be conservative with confidence. Lower scores when evidence is thin.
Flag all uncertainties. Return JSON.`,
};

const VERIFICATION_SCHEMA = `Return ONLY valid JSON:
{
  "overallConfidence": number (0.0-1.0),
  "claims": [{ "text": string, "supported": boolean, "evidenceCount": number, "sources": [string], "confidence": number }],
  "contradictions": [{ "claim1": string, "claim2": string, "paper1": string, "paper2": string, "description": string }],
  "evidenceCoverage": number (0.0-1.0, fraction of claims with evidence),
  "rationale": string (explain overall confidence assessment),
  "warnings": [string]
}`;

export async function verifyAnswer(
  answer: SynthesisResult,
  mode: ConfidenceMode = 'balanced'
): Promise<VerificationResult> {
  const graphContradictions = await getContradictions();

  const contextBlock = `
ANSWER TO VERIFY:
${answer.answer}

EVIDENCE PROVIDED:
${answer.evidence.map(e => `- [${e.type}] "${e.text}" (${e.paperTitle})`).join('\n')}

KNOWN CONTRADICTIONS IN GRAPH:
${graphContradictions.map(c => `- "${(c.claim1 as Record<string, string>).text}" vs "${(c.claim2 as Record<string, string>).text}" (${c.paper1} vs ${c.paper2})`).join('\n') || 'None found'}

ORIGINAL CONFIDENCE: ${answer.confidence}
REASONING: ${answer.reasoning}`;

  const response = await generateCompletion(
    VERIFICATION_PROMPTS[mode] + '\n\n' + VERIFICATION_SCHEMA,
    contextBlock,
    { json: true, temperature: 0.2, maxTokens: 3000 }
  );

  try {
    const parsed = JSON.parse(response);
    return {
      overallConfidence: parsed.overallConfidence ?? 0.5,
      mode,
      claims: (parsed.claims || []).map((c: { text: string; supported: boolean; evidenceCount: number; sources: string[]; confidence: number }) => ({
        text: c.text,
        supported: c.supported ?? false,
        evidenceCount: c.evidenceCount ?? 0,
        sources: c.sources || [],
        confidence: c.confidence ?? 0.5,
      })),
      contradictions: (parsed.contradictions || []).map((c: { claim1: string; claim2: string; paper1: string; paper2: string; description: string }) => ({
        claim1: c.claim1,
        claim2: c.claim2,
        paper1: c.paper1,
        paper2: c.paper2,
        description: c.description,
      })),
      evidenceCoverage: parsed.evidenceCoverage ?? 0.5,
      rationale: parsed.rationale || 'Verification complete.',
      warnings: parsed.warnings || [],
    };
  } catch {
    return {
      overallConfidence: 0.5,
      mode,
      claims: [],
      contradictions: [],
      evidenceCoverage: 0,
      rationale: 'Verification could not complete. Results may be unreliable.',
      warnings: ['Verification process encountered an error'],
    };
  }
}
