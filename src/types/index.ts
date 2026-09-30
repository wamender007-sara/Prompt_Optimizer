export type PlatformId = 'chatgpt' | 'claude' | 'gemini' | 'cursor' | 'deepseek' | 'perplexity' | 'custom';

export type CompressionMode = 
  | 'production_balanced' 
  | 'ultra_distilled' 
  | 'structured_xml' 
  | 'target_gemini'
  | 'target_claude'
  | 'target_chatgpt'
  | 'target_cursor'
  | 'target_deepseek'
  | 'target_perplexity';

export interface PromptSlot {
  id: string;
  platform: PlatformId;
  name: string;
  prompt: string;
  enabled: boolean;
}

export interface DirectiveItem {
  id: string;
  category: 'core_intent' | 'hard_constraint' | 'edge_case' | 'output_format';
  text: string;
  sourcePlatforms: string[];
  retained: boolean;
}

export interface FluffItem {
  id: string;
  phrase: string;
  category: 'boilerplate_persona' | 'polite_filler' | 'generic_disclaimer' | 'redundancy';
  sourcePlatform: string;
  whyRemoved: string;
}

export interface ConflictItem {
  id: string;
  directiveA: { platform: string; text: string };
  directiveB: { platform: string; text: string };
  nature: string;
  reconciliation: string;
  resolutionStrategy: 'strictest_rule' | 'schema_harmonization' | 'hybrid_compromise';
}

export interface PlatformContribution {
  platform: string;
  originalTokens: number;
  contributionPercent: number;
  uniqueInsightsProvided: string[];
  color: string;
}

export interface TokenMetrics {
  originalTotalTokens: number;
  originalTotalChars: number;
  compressedTokens: number;
  compressedChars: number;
  reductionPercentage: number;
  estimatedLatencySavedMs: number;
  estimatedCostSavedPer1MRuns: number;
}

export interface SynthesisResult {
  id: string;
  timestamp: string;
  mode: CompressionMode;
  targetPlatform?: PlatformId;
  masterPrompt: string;
  coreIntent: string;
  metrics: TokenMetrics;
  preservedDirectives: DirectiveItem[];
  fluffRemoved: FluffItem[];
  conflictMatrix: ConflictItem[];
  contributions: PlatformContribution[];
}

export interface PresetScenario {
  id: string;
  title: string;
  description: string;
  tags: string[];
  slots: {
    platform: PlatformId;
    name: string;
    prompt: string;
  }[];
  samplePayload: {
    title: string;
    description: string;
    input: string;
  };
}

export interface TestDriveRequest {
  masterPrompt: string;
  testPayload: string;
  mode: CompressionMode;
}

export interface TestDriveResponse {
  response: string;
  executionTimeMs: number;
  outputTokens: number;
  modelSimulated: string;
}
