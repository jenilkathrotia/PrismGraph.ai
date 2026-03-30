import OpenAI from 'openai';

const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: AI_API_KEY,
      baseURL: AI_BASE_URL,
    });
  }
  return client;
}

export function isAIAvailable(): boolean {
  return AI_API_KEY !== '' && AI_API_KEY !== 'your-api-key-here';
}

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number; json?: boolean } = {}
): Promise<string> {
  if (!isAIAvailable()) {
    return getMockResponse(userPrompt);
  }

  try {
    const response = await getClient().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 4000,
      response_format: options.json ? { type: 'json_object' } : undefined,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('AI provider error:', error);
    return getMockResponse(userPrompt);
  }
}

function getMockResponse(prompt: string): string {
  // Fallback mock responses when AI is not available
  if (prompt.includes('extract')) {
    return JSON.stringify({
      paper: {
        title: 'Extracted Paper Title',
        abstract: 'This paper explores novel approaches in the field.',
        year: 2024,
        summary: 'A comprehensive study of modern techniques.',
      },
      authors: [{ name: 'Sample Author', affiliation: 'University' }],
      topics: [{ name: 'Machine Learning' }, { name: 'Natural Language Processing' }],
      methods: [{ name: 'Deep Learning' }],
      claims: [{ text: 'Our method achieves state-of-the-art results.', type: 'finding', confidence: 0.8 }],
      datasets: [{ name: 'Sample Dataset' }],
      keywords: ['machine learning', 'NLP'],
      citations: [],
    });
  }

  if (prompt.includes('synthesize') || prompt.includes('answer')) {
    return JSON.stringify({
      answer: 'Based on the research papers in this knowledge graph, the main methods in this field include self-attention mechanisms (Vaswani et al., 2017), masked language modeling (Devlin et al., 2019), and autoregressive pre-training (Radford et al., 2019). Key disagreements exist around the necessity of bidirectional vs. unidirectional pre-training, and whether larger models or compressed models represent the optimal approach for practical deployment.',
      evidence: [
        { paperId: 'paper_attention', paperTitle: 'Attention Is All You Need', text: 'Self-attention replaces recurrence entirely for sequence modeling.', relevance: 0.95, type: 'supports' },
        { paperId: 'paper_bert', paperTitle: 'BERT', text: 'Bidirectional pre-training is crucial for language understanding.', relevance: 0.9, type: 'supports' },
        { paperId: 'paper_gpt2', paperTitle: 'GPT-2', text: 'Autoregressive models can perform tasks zero-shot.', relevance: 0.85, type: 'contradicts' },
      ],
      graphPath: ['paper_attention', 'topic_transformers', 'paper_bert', 'paper_gpt2'],
      confidence: 0.82,
      followUpQuestions: [
        'How do scaling laws affect the choice between bidirectional and autoregressive models?',
        'What are the trade-offs between model size and deployment efficiency?',
        'Which pre-training approach performs best on specific downstream tasks?',
      ],
      reasoning: 'I retrieved all papers connected to transformer architecture and pre-training topics, then analyzed their claims for agreements and disagreements. The evidence shows a clear methodological divergence between the BERT and GPT lineages.',
    });
  }

  if (prompt.includes('verify')) {
    return JSON.stringify({
      overallConfidence: 0.78,
      claims: [
        { text: 'Self-attention is the dominant mechanism', supported: true, evidenceCount: 3, sources: ['paper_attention', 'paper_bert'], confidence: 0.95 },
        { text: 'Bidirectional pre-training is necessary', supported: true, evidenceCount: 2, sources: ['paper_bert'], confidence: 0.7 },
        { text: 'Larger models always perform better', supported: false, evidenceCount: 1, sources: ['paper_distilbert'], confidence: 0.4 },
      ],
      contradictions: [
        { claim1: 'Bidirectional pre-training is crucial', claim2: 'Autoregressive models achieve strong results', paper1: 'BERT', paper2: 'GPT-2', description: 'Fundamental disagreement on directionality' },
      ],
      evidenceCoverage: 0.75,
      rationale: 'The answer is well-supported for claims about self-attention and transformer architecture. However, confidence is reduced due to the unresolved debate between bidirectional and autoregressive approaches.',
      warnings: ['The claim about model size is contested by knowledge distillation research'],
    });
  }

  if (prompt.includes('insight')) {
    return JSON.stringify({
      insights: [
        { type: 'influential_author', title: 'Ashish Vaswani - Foundational Contributor', description: 'Co-authored the Transformer paper cited by all other papers in the graph.', relatedNodes: ['author_vaswani', 'paper_attention'], score: 0.95 },
        { type: 'contradiction', title: 'Bidirectional vs. Autoregressive Pre-training', description: 'BERT and GPT-2 present opposing views on pre-training directionality.', relatedNodes: ['paper_bert', 'paper_gpt2'], score: 0.88 },
        { type: 'emerging_theme', title: 'Model Efficiency is Growing', description: 'DistilBERT and Scaling Laws papers both focus on compute optimization.', relatedNodes: ['paper_distilbert', 'paper_scaling'], score: 0.82 },
        { type: 'bridge_connection', title: 'Transformer → Pre-training Bridge', description: 'The Transformer architecture paper bridges NMT with modern pre-training.', relatedNodes: ['paper_attention', 'topic_pretraining'], score: 0.9 },
        { type: 'foundational_paper', title: 'Attention Is All You Need - Hub Paper', description: 'Cited by every other paper in the graph, making it the foundational node.', relatedNodes: ['paper_attention'], score: 0.97 },
      ],
    });
  }

  return JSON.stringify({ result: 'Mock response - configure AI_API_KEY for live results' });
}
