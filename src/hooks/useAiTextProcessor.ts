import { useState, useCallback, useEffect } from 'react';
import ChromeAiService from '../services/chromeAiService';
import { 
  AiCapabilities, 
  ProcessedText, 
  ProcessingOperation, 
  SummaryOptions,
  ComplexityLevel,
  QuestionType,
  AiErrorType 
} from '../types/chromeAi';

interface UseAiTextProcessorReturn {
  // State
  capabilities: AiCapabilities | null;
  isProcessing: boolean;
  error: string | null;
  processedResults: ProcessedText | null;
  
  // Actions
  processText: (text: string, operations: ProcessingOperation[]) => Promise<ProcessedText>;
  summarizeText: (text: string, options?: SummaryOptions) => Promise<string>;
  simplifyText: (text: string, level?: ComplexityLevel) => Promise<string>;
  translateText: (text: string, targetLanguage: string) => Promise<string>;
  proofreadText: (text: string) => Promise<any>;
  generateStudyQuestions: (text: string, questionTypes?: QuestionType[]) => Promise<any[]>;
  clearResults: () => void;
  clearError: () => void;
}

export const useAiTextProcessor = (): UseAiTextProcessorReturn => {
  const [capabilities, setCapabilities] = useState<AiCapabilities | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedResults, setProcessedResults] = useState<ProcessedText | null>(null);

  // Initialize capabilities on mount
  useEffect(() => {
    const initializeCapabilities = async () => {
      try {
        const caps = await ChromeAiService.checkAiAvailability();
        setCapabilities(caps);
      } catch (err) {
        console.error('Failed to check AI capabilities:', err);
        setError('Failed to initialize AI capabilities');
      }
    };

    initializeCapabilities();
  }, []);

  const handleError = useCallback((err: any) => {
    console.error('AI processing error:', err);
    
    if (err.message && Object.values(AiErrorType).includes(err.message as AiErrorType)) {
      setError(ChromeAiService.getErrorMessage(err.message as AiErrorType));
    } else {
      setError('An unexpected error occurred during processing');
    }
  }, []);

  const processText = useCallback(async (
    text: string, 
    operations: ProcessingOperation[]
  ): Promise<ProcessedText> => {
    if (!text.trim()) {
      throw new Error('Text cannot be empty');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const results: ProcessedText = { original: text };

      // Process each operation
      for (const operation of operations) {
        try {
          switch (operation) {
            case 'summarize':
              results.summary = await ChromeAiService.summarizeText(text, {
                length: 'detailed',
                format: 'paragraph'
              });
              break;
              
            case 'simplify':
              results.simplified = await ChromeAiService.simplifyText(text, {
                level: 'undergraduate',
                preserveTechnicalTerms: true,
                includeDefinitions: true
              });
              break;
              
            case 'translate':
              const translationResult = await ChromeAiService.translateText(text, 'es');
              results.translated = typeof translationResult === 'string' ? translationResult : translationResult.translatedText;
              break;
              
            case 'proofread':
              results.proofread = await ChromeAiService.proofreadText(text);
              break;
              
            case 'generate-questions':
              results.studyQuestions = await ChromeAiService.generateStudyQuestions(text, [
                'multiple-choice',
                'short-answer'
              ]);
              break;
          }
        } catch (operationError) {
          console.warn(`Failed to process ${operation}:`, operationError);
          // Continue with other operations even if one fails
        }
      }

      setProcessedResults(results);
      return results;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [handleError]);

  const summarizeText = useCallback(async (
    text: string, 
    options: SummaryOptions = { length: 'detailed', format: 'paragraph' }
  ): Promise<string> => {
    setIsProcessing(true);
    setError(null);

    try {
      const summary = await ChromeAiService.summarizeText(text, options);
      return summary;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [handleError]);

  const simplifyText = useCallback(async (
    text: string, 
    level: ComplexityLevel = {
      level: 'undergraduate',
      preserveTechnicalTerms: true,
      includeDefinitions: true
    }
  ): Promise<string> => {
    setIsProcessing(true);
    setError(null);

    try {
      const simplified = await ChromeAiService.simplifyText(text, level);
      return simplified;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [handleError]);

  const translateText = useCallback(async (
    text: string, 
    targetLanguage: string
  ): Promise<string> => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await ChromeAiService.translateText(text, targetLanguage);
      // Handle both string and object returns for compatibility
      return typeof result === 'string' ? result : result.translatedText;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [handleError]);

  const proofreadText = useCallback(async (text: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const proofread = await ChromeAiService.proofreadText(text);
      return proofread;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [handleError]);

  const generateStudyQuestions = useCallback(async (
    text: string, 
    questionTypes: QuestionType[] = ['multiple-choice', 'short-answer']
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      const questions = await ChromeAiService.generateStudyQuestions(text, questionTypes);
      return questions;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [handleError]);

  const clearResults = useCallback(() => {
    setProcessedResults(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    capabilities,
    isProcessing,
    error,
    processedResults,
    processText,
    summarizeText,
    simplifyText,
    translateText,
    proofreadText,
    generateStudyQuestions,
    clearResults,
    clearError
  };
};