/**
 * AI Training Data Export Utility
 * Exports processed content in formats suitable for AI training
 */

import { jsPDF } from 'jspdf';
import { ProcessedText, StudyQuestion, ProofreadResult } from '../types/chromeAi';

export interface AITrainingData {
  metadata: {
    exportDate: string;
    version: string;
    contentType: string;
    processingOperations: string[];
  };
  original: {
    text: string;
    language: string;
    wordCount: number;
    characterCount: number;
  };
  processed: {
    summary?: string;
    simplified?: string;
    translations?: Array<{
      language: string;
      text: string;
      confidence: number;
    }>;
    proofread?: {
      correctedText: string;
      corrections: Array<{
        type: string;
        original: string;
        corrected: string;
        explanation: string;
      }>;
      metrics: {
        readabilityScore: number;
        grammarIssues: number;
        styleIssues: number;
      };
    };
    studyQuestions?: StudyQuestion[];
  };
  aiMetadata: {
    model: string;
    processingTime: number;
    confidence: number;
  };
}

/**
 * Export processed content as JSON for AI training
 */
export const exportAsAITrainingJSON = (
  processedText: ProcessedText,
  metadata?: Partial<AITrainingData['metadata']>
): string => {
  const trainingData: AITrainingData = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      contentType: 'text-processing',
      processingOperations: Object.keys(processedText).filter(k => k !== 'original'),
      ...metadata
    },
    original: {
      text: processedText.original,
      language: 'en', // Could be detected
      wordCount: processedText.original.split(/\s+/).length,
      characterCount: processedText.original.length
    },
    processed: {
      summary: processedText.summary,
      simplified: processedText.simplified,
      translations: processedText.translated ? [{
        language: 'target',
        text: processedText.translated,
        confidence: 0.95
      }] : undefined,
      proofread: processedText.proofread ? {
        correctedText: processedText.proofread.correctedText,
        corrections: processedText.proofread.suggestions.map(s => ({
          type: s.type,
          original: s.original,
          corrected: s.suggested,
          explanation: s.explanation
        })),
        metrics: processedText.proofread.metrics
      } : undefined,
      studyQuestions: processedText.studyQuestions
    },
    aiMetadata: {
      model: 'Gemini Nano (Chrome AI)',
      processingTime: Date.now(),
      confidence: 0.92
    }
  };

  return JSON.stringify(trainingData, null, 2);
};

/**
 * Export as JSONL format (one JSON object per line) for ML training
 */
export const exportAsJSONL = (processedText: ProcessedText): string => {
  const lines: string[] = [];

  // Original text entry
  lines.push(JSON.stringify({
    text: processedText.original,
    type: 'original'
  }));

  // Summary entry
  if (processedText.summary) {
    lines.push(JSON.stringify({
      input: processedText.original,
      output: processedText.summary,
      task: 'summarization'
    }));
  }

  // Simplification entry
  if (processedText.simplified) {
    lines.push(JSON.stringify({
      input: processedText.original,
      output: processedText.simplified,
      task: 'simplification'
    }));
  }

  // Translation entry
  if (processedText.translated) {
    lines.push(JSON.stringify({
      input: processedText.original,
      output: processedText.translated,
      task: 'translation'
    }));
  }

  // Proofreading entry
  if (processedText.proofread) {
    lines.push(JSON.stringify({
      input: processedText.original,
      output: processedText.proofread.correctedText,
      task: 'proofreading',
      corrections: processedText.proofread.suggestions.length
    }));
  }

  // Study questions entries
  if (processedText.studyQuestions) {
    processedText.studyQuestions.forEach(q => {
      lines.push(JSON.stringify({
        context: processedText.original,
        question: q.question,
        answer: q.correctAnswer,
        type: q.type,
        difficulty: q.difficulty,
        task: 'question-generation'
      }));
    });
  }

  return lines.join('\n');
};

/**
 * Export as comprehensive PDF report
 */
export const exportAsPDFReport = async (
  processedText: ProcessedText,
  title: string = 'AI Processing Report'
): Promise<void> => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) doc.setFont('helvetica', 'bold');
    else doc.setFont('helvetica', 'normal');

    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += 5;
  };

  // Title
  addText(title, 20, true);
  addText(`Generated: ${new Date().toLocaleString()}`, 10);
  yPosition += 10;

  // Original Text
  addText('Original Text', 16, true);
  addText(processedText.original, 11);
  yPosition += 10;

  // Summary
  if (processedText.summary) {
    addText('Summary', 16, true);
    addText(processedText.summary, 11);
    yPosition += 10;
  }

  // Simplified Version
  if (processedText.simplified) {
    addText('Simplified Version', 16, true);
    addText(processedText.simplified, 11);
    yPosition += 10;
  }

  // Translation
  if (processedText.translated) {
    addText('Translation', 16, true);
    addText(processedText.translated, 11);
    yPosition += 10;
  }

  // Proofreading Results
  if (processedText.proofread) {
    addText('Proofreading Results', 16, true);
    addText(`Readability Score: ${processedText.proofread.metrics.readabilityScore}/100`, 11);
    addText(`Grammar Issues: ${processedText.proofread.metrics.grammarIssues}`, 11);
    addText(`Style Issues: ${processedText.proofread.metrics.styleIssues}`, 11);
    yPosition += 5;
    addText('Corrected Text:', 12, true);
    addText(processedText.proofread.correctedText, 11);
    yPosition += 10;
  }

  // Study Questions
  if (processedText.studyQuestions && processedText.studyQuestions.length > 0) {
    addText('Study Questions', 16, true);
    processedText.studyQuestions.forEach((q, index) => {
      addText(`Question ${index + 1} (${q.difficulty})`, 12, true);
      addText(q.question, 11);
      
      if (q.options) {
        q.options.forEach((opt, i) => {
          addText(`  ${String.fromCharCode(65 + i)}. ${opt}`, 10);
        });
      }
      
      if (q.correctAnswer) {
        addText(`Answer: ${q.correctAnswer}`, 10, true);
      }
      
      if (q.explanation) {
        addText(`Explanation: ${q.explanation}`, 10);
      }
      yPosition += 5;
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text('Generated by TechHub Chrome AI Integration', margin, doc.internal.pageSize.getHeight() - 10);

  // Save the PDF
  doc.save(`ai-processing-report-${Date.now()}.pdf`);
};

/**
 * Download JSON file
 */
export const downloadJSON = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Download JSONL file
 */
export const downloadJSONL = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'application/x-jsonlines' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export all formats at once
 */
export const exportAllFormats = async (processedText: ProcessedText, baseName: string = 'ai-export'): Promise<void> => {
  // Export JSON
  const jsonData = exportAsAITrainingJSON(processedText);
  downloadJSON(jsonData, `${baseName}-training-data.json`);

  // Export JSONL
  const jsonlData = exportAsJSONL(processedText);
  downloadJSONL(jsonlData, `${baseName}-training-data.jsonl`);

  // Export PDF
  await exportAsPDFReport(processedText, 'AI Processing Report');
};