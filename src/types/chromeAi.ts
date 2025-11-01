// Chrome AI API Type Definitions
export interface AiCapabilities {
  promptApi: boolean;
  summarizer: boolean;
  writer: boolean;
  rewriter: boolean;
  proofreader: boolean;
  supportedLanguages: string[];
}

export interface SummaryOptions {
  length: 'brief' | 'detailed' | 'comprehensive';
  format: 'bullets' | 'paragraph' | 'outline';
  focusAreas?: string[];
}

export interface ComplexityLevel {
  level: 'elementary' | 'high-school' | 'undergraduate' | 'graduate';
  preserveTechnicalTerms: boolean;
  includeDefinitions: boolean;
}

export interface ProofreadResult {
  correctedText: string;
  suggestions: Suggestion[];
  metrics: {
    readabilityScore: number;
    grammarIssues: number;
    styleIssues: number;
  };
}

export interface Suggestion {
  type: 'grammar' | 'style' | 'clarity' | 'word-choice';
  original: string;
  suggested: string;
  explanation: string;
  position: { start: number; end: number };
}

export interface StudyQuestion {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'true-false';
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface ProcessedText {
  original: string;
  summary?: string;
  simplified?: string;
  translated?: string;
  proofread?: ProofreadResult;
  rewrite?: string;
  studyQuestions?: StudyQuestion[];
}

export interface ContentMetadata {
  type: 'pdf' | 'text' | 'url' | 'repository';
  source: string;
  title?: string;
  language?: string;
}

export enum AiErrorType {
  NOT_SUPPORTED = 'not_supported',
  NOT_AVAILABLE = 'not_available',
  QUOTA_EXCEEDED = 'quota_exceeded',
  PROCESSING_ERROR = 'processing_error',
  NETWORK_ERROR = 'network_error'
}

export type ProcessingOperation = 
  | 'summarize'
  | 'simplify'
  | 'translate'
  | 'proofread'
  | 'rewrite'
  | 'generate-questions';

export type QuestionType = 'multiple-choice' | 'short-answer' | 'essay' | 'true-false';

export type FileFormat = 'pdf' | 'txt' | 'html' | 'md';

// Chrome AI API interfaces (based on Chrome's built-in AI APIs)
export interface ChromeAI {
  promptApi?: {
    create: (options?: any) => Promise<any>;
  };
  summarizer?: {
    create: (options?: any) => Promise<any>;
    capabilities: () => Promise<any>;
  };
  translator?: {
    create: (options?: any) => Promise<any>;
    capabilities: () => Promise<any>;
  };
  writer?: {
    create: (options?: any) => Promise<any>;
    capabilities: () => Promise<any>;
  };
  rewriter?: {
    create: (options?: any) => Promise<any>;
    capabilities: () => Promise<any>;
  };
  proofreader?: {
    create: (options?: any) => Promise<any>;
    capabilities: () => Promise<any>;
  };
}

declare global {
  interface Window {
    ai?: ChromeAI;
  }
}