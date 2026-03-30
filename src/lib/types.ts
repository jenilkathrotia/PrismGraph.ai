// ============================================================
// PrismGraph.ai - Core Type Definitions
// ============================================================

// ---- Graph Node Types ----

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  year: number;
  doi?: string;
  url?: string;
  summary?: string;
  pdfPath?: string;
  createdAt: string;
}

export interface Author {
  id: string;
  name: string;
  affiliation?: string;
  email?: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
}

export interface Method {
  id: string;
  name: string;
  description?: string;
}

export interface Claim {
  id: string;
  text: string;
  type: 'finding' | 'hypothesis' | 'conclusion' | 'limitation';
  confidence?: number;
  paperId: string;
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

export interface Venue {
  id: string;
  name: string;
  type: 'journal' | 'conference' | 'preprint' | 'workshop';
}

export interface Institution {
  id: string;
  name: string;
  country?: string;
}

export interface Cluster {
  id: string;
  label: string;
  summary?: string;
  paperCount: number;
}

export interface Keyword {
  id: string;
  term: string;
}

// ---- Graph Visualization Types ----

export interface GraphNodeData {
  id: string;
  label: string;
  type: 'paper' | 'author' | 'topic' | 'method' | 'claim' | 'dataset' | 'venue' | 'institution' | 'cluster' | 'keyword';
  properties: Record<string, unknown>;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  type: string;
  properties?: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}

// ---- AI Pipeline Types ----

export interface ExtractionResult {
  paper: Omit<Paper, 'id' | 'createdAt'>;
  authors: Omit<Author, 'id'>[];
  topics: Omit<Topic, 'id'>[];
  methods: Omit<Method, 'id'>[];
  claims: Omit<Claim, 'id' | 'paperId'>[];
  datasets: Omit<Dataset, 'id'>[];
  venue?: Omit<Venue, 'id'>;
  keywords: string[];
  citations: string[];
}

export interface SynthesisResult {
  answer: string;
  evidence: EvidenceItem[];
  graphPath: string[];
  confidence: number;
  followUpQuestions: string[];
  reasoning: string;
}

export interface EvidenceItem {
  paperId: string;
  paperTitle: string;
  text: string;
  relevance: number;
  type: 'supports' | 'contradicts' | 'neutral';
}

export interface VerificationResult {
  overallConfidence: number;
  mode: 'fast' | 'balanced' | 'strict';
  claims: VerifiedClaim[];
  contradictions: Contradiction[];
  evidenceCoverage: number;
  rationale: string;
  warnings: string[];
}

export interface VerifiedClaim {
  text: string;
  supported: boolean;
  evidenceCount: number;
  sources: string[];
  confidence: number;
}

export interface Contradiction {
  claim1: string;
  claim2: string;
  paper1: string;
  paper2: string;
  description: string;
}

export interface InsightResult {
  type: 'influential_author' | 'emerging_theme' | 'contradiction' | 'bridge_connection' | 'common_method' | 'foundational_paper' | 'underexplored' | 'dataset_reuse';
  title: string;
  description: string;
  relatedNodes: string[];
  score: number;
}

// ---- API Types ----

export interface UploadResponse {
  success: boolean;
  paperId?: string;
  extraction?: ExtractionResult;
  error?: string;
}

export interface GraphResponse {
  success: boolean;
  data?: GraphData;
  error?: string;
}

export interface AssistantResponse {
  success: boolean;
  result?: SynthesisResult;
  error?: string;
}

export interface VerifyResponse {
  success: boolean;
  result?: VerificationResult;
  error?: string;
}

export interface InsightsResponse {
  success: boolean;
  insights?: InsightResult[];
  error?: string;
}

// ---- UI State Types ----

export type ConfidenceMode = 'fast' | 'balanced' | 'strict';

export type ActivePanel = 'detail' | 'assistant' | 'verification' | 'insights' | 'upload' | null;

export interface WorkspaceState {
  selectedNode: GraphNodeData | null;
  activePanel: ActivePanel;
  confidenceMode: ConfidenceMode;
  graphData: GraphData;
  isLoading: boolean;
  error: string | null;
}

export type NodeType = GraphNodeData['type'];

export const NODE_COLORS: Record<NodeType, string> = {
  paper: '#3b82f6',      // blue
  author: '#10b981',     // green
  topic: '#8b5cf6',      // purple
  method: '#f59e0b',     // amber
  claim: '#ef4444',      // red
  dataset: '#eab308',    // yellow
  venue: '#06b6d4',      // cyan
  institution: '#ec4899', // pink
  cluster: '#6366f1',    // indigo
  keyword: '#64748b',    // slate
};

export const NODE_LABELS: Record<NodeType, string> = {
  paper: 'Paper',
  author: 'Author',
  topic: 'Topic',
  method: 'Method',
  claim: 'Claim',
  dataset: 'Dataset',
  venue: 'Venue',
  institution: 'Institution',
  cluster: 'Cluster',
  keyword: 'Keyword',
};
