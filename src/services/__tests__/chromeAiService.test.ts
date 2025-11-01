import ChromeAiService from '../chromeAiService';
import { AiErrorType } from '../../types/chromeAi';

// Mock Chrome AI APIs
const mockAi = {
  promptApi: {
    create: jest.fn()
  },
  summarizer: {
    create: jest.fn(),
    capabilities: jest.fn()
  },
  translator: {
    create: jest.fn(),
    capabilities: jest.fn()
  },
  writer: {
    create: jest.fn(),
    capabilities: jest.fn()
  }
};

// Mock window.ai
Object.defineProperty(window, 'ai', {
  value: mockAi,
  writable: true
});

describe('ChromeAiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset capabilities cache
    ChromeAiService.resetCapabilities();
  });

  describe('checkAiAvailability', () => {
    it('should detect available AI capabilities', async () => {
      mockAi.promptApi.create.mockResolvedValue({});
      mockAi.summarizer.capabilities.mockResolvedValue({ available: 'readily' });
      mockAi.translator.capabilities.mockResolvedValue({ available: 'readily' });
      mockAi.writer.capabilities.mockResolvedValue({ available: 'readily' });

      const service = ChromeAiService;
      const capabilities = await service.checkAiAvailability();

      expect(capabilities.promptApi).toBe(true);
      expect(capabilities.summarizer).toBe(true);
      expect(capabilities.translator).toBe(true);
      expect(capabilities.writer).toBe(true);
      expect(capabilities.supportedLanguages).toContain('en');
    });

    it('should handle unavailable AI APIs gracefully', async () => {
      // Remove window.ai to simulate unsupported browser
      (window as any).ai = undefined;

      const service = ChromeAiService;
      const capabilities = await service.checkAiAvailability();

      expect(capabilities.promptApi).toBe(false);
      expect(capabilities.summarizer).toBe(false);
      expect(capabilities.translator).toBe(false);
      expect(capabilities.writer).toBe(false);
      expect(capabilities.supportedLanguages).toEqual([]);

      // Restore window.ai
      (window as any).ai = mockAi;
    });

    it('should handle partial API availability', async () => {
      mockAi.promptApi.create.mockResolvedValue({});
      mockAi.summarizer.capabilities.mockResolvedValue({ available: 'readily' });
      mockAi.translator.capabilities.mockRejectedValue(new Error('Not available'));
      mockAi.writer.capabilities.mockRejectedValue(new Error('Not available'));

      const service = ChromeAiService;
      const capabilities = await service.checkAiAvailability();

      expect(capabilities.promptApi).toBe(true);
      expect(capabilities.summarizer).toBe(true);
      expect(capabilities.translator).toBe(false);
      expect(capabilities.writer).toBe(false);
    });
  });

  describe('summarizeText', () => {
    it('should summarize text successfully', async () => {
      const mockSummarizer = {
        summarize: jest.fn().mockResolvedValue('This is a summary')
      };
      
      mockAi.summarizer.capabilities.mockResolvedValue({ available: 'readily' });
      mockAi.summarizer.create.mockResolvedValue(mockSummarizer);

      const service = ChromeAiService;
      const result = await service.summarizeText('Long text to summarize', {
        length: 'brief',
        format: 'paragraph'
      });

      expect(result).toBe('This is a summary');
      expect(mockSummarizer.summarize).toHaveBeenCalledWith('Long text to summarize');
    });

    it('should throw error when summarizer is not available', async () => {
      mockAi.summarizer.capabilities.mockResolvedValue({ available: 'no' });

      const service = ChromeAiService;
      
      await expect(service.summarizeText('text', { length: 'brief', format: 'paragraph' }))
        .rejects.toThrow(AiErrorType.NOT_AVAILABLE);
    });
  });

  describe('simplifyText', () => {
    it('should simplify text using writer API', async () => {
      const mockWriter = {
        write: jest.fn().mockResolvedValue('Simplified text')
      };
      
      mockAi.writer.capabilities.mockResolvedValue({ available: 'readily' });
      mockAi.writer.create.mockResolvedValue(mockWriter);

      const service = ChromeAiService;
      const result = await service.simplifyText('Complex text', {
        level: 'undergraduate',
        preserveTechnicalTerms: true,
        includeDefinitions: true
      });

      expect(result).toBe('Simplified text');
      expect(mockWriter.write).toHaveBeenCalled();
    });

    it('should fallback to prompt API when writer is not available', async () => {
      const mockSession = {
        prompt: jest.fn().mockResolvedValue('Simplified text via prompt')
      };
      
      mockAi.writer.capabilities.mockResolvedValue({ available: 'no' });
      mockAi.promptApi.create.mockResolvedValue(mockSession);

      const service = ChromeAiService;
      const result = await service.simplifyText('Complex text', {
        level: 'high-school',
        preserveTechnicalTerms: false,
        includeDefinitions: false
      });

      expect(result).toBe('Simplified text via prompt');
      expect(mockSession.prompt).toHaveBeenCalled();
    });
  });

  describe('translateText', () => {
    it('should translate text successfully', async () => {
      const mockTranslator = {
        translate: jest.fn().mockResolvedValue('Texto traducido')
      };
      
      mockAi.translator.capabilities.mockResolvedValue({ available: 'readily' });
      mockAi.translator.create.mockResolvedValue(mockTranslator);

      const service = ChromeAiService;
      const result = await service.translateText('Text to translate', 'es');

      expect(result).toBe('Texto traducido');
      expect(mockTranslator.translate).toHaveBeenCalledWith('Text to translate');
    });
  });

  describe('proofreadText', () => {
    it('should proofread text and return structured result', async () => {
      const mockProofreadResult = {
        correctedText: 'Corrected text',
        suggestions: [],
        metrics: { readabilityScore: 85, grammarIssues: 0, styleIssues: 1 }
      };
      
      const mockWriter = {
        write: jest.fn().mockResolvedValue(JSON.stringify(mockProofreadResult))
      };
      
      mockAi.writer.capabilities.mockResolvedValue({ available: 'readily' });
      mockAi.writer.create.mockResolvedValue(mockWriter);

      const service = ChromeAiService;
      const result = await service.proofreadText('Text with errors');

      expect(result).toEqual(mockProofreadResult);
    });

    it('should handle non-JSON responses gracefully', async () => {
      const mockWriter = {
        write: jest.fn().mockResolvedValue('Just corrected text without JSON')
      };
      
      mockAi.writer.capabilities.mockResolvedValue({ available: 'readily' });
      mockAi.writer.create.mockResolvedValue(mockWriter);

      const service = ChromeAiService;
      const result = await service.proofreadText('Text with errors');

      expect(result.correctedText).toBe('Just corrected text without JSON');
      expect(result.suggestions).toEqual([]);
      expect(result.metrics).toEqual({
        readabilityScore: 0,
        grammarIssues: 0,
        styleIssues: 0
      });
    });
  });

  describe('generateStudyQuestions', () => {
    it('should generate study questions successfully', async () => {
      const mockQuestions = [
        {
          id: '1',
          type: 'multiple-choice',
          question: 'What is the main topic?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A',
          explanation: 'Because...',
          difficulty: 'medium',
          topic: 'Main Topic'
        }
      ];
      
      const mockSession = {
        prompt: jest.fn().mockResolvedValue(JSON.stringify(mockQuestions))
      };
      
      mockAi.promptApi.create.mockResolvedValue(mockSession);

      const service = ChromeAiService;
      const result = await service.generateStudyQuestions('Study material', ['multiple-choice']);

      expect(result).toEqual(mockQuestions);
    });

    it('should provide fallback questions when JSON parsing fails', async () => {
      const mockSession = {
        prompt: jest.fn().mockResolvedValue('Invalid JSON response')
      };
      
      mockAi.promptApi.create.mockResolvedValue(mockSession);

      const service = ChromeAiService;
      const result = await service.generateStudyQuestions('Study material', ['short-answer']);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('short-answer');
      expect(result[0].question).toContain('main points');
    });
  });

  describe('chunkText', () => {
    it('should return single chunk for short text', () => {
      const service = ChromeAiService;
      const result = service.chunkText('Short text', 1000);

      expect(result).toEqual(['Short text']);
    });

    it('should split long text into chunks', () => {
      const longText = 'First sentence. Second sentence. Third sentence. Fourth sentence.';
      const service = ChromeAiService;
      const result = service.chunkText(longText, 30);

      expect(result.length).toBeGreaterThan(1);
      expect(result.every(chunk => chunk.length <= 50)).toBe(true); // Allow some buffer
    });
  });

  describe('getErrorMessage', () => {
    it('should return appropriate error messages', () => {
      const service = ChromeAiService;

      expect(service.getErrorMessage(AiErrorType.NOT_SUPPORTED))
        .toContain('not supported');
      expect(service.getErrorMessage(AiErrorType.NOT_AVAILABLE))
        .toContain('not currently available');
      expect(service.getErrorMessage(AiErrorType.QUOTA_EXCEEDED))
        .toContain('quota exceeded');
      expect(service.getErrorMessage(AiErrorType.PROCESSING_ERROR))
        .toContain('error occurred while processing');
      expect(service.getErrorMessage(AiErrorType.NETWORK_ERROR))
        .toContain('Network error');
    });
  });
});