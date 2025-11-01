import jsPDF from 'jspdf';
import { ProcessedText, ContentMetadata } from '../types/chromeAi';

export interface ExportOptions {
  format: 'pdf' | 'txt' | 'html' | 'json';
  includeMetadata: boolean;
  includeTimestamp: boolean;
  filename?: string;
}

export class ExportUtils {
  /**
   * Export processed text in multiple formats
   */
  static async exportProcessedText(
    processedText: ProcessedText,
    metadata: ContentMetadata | null,
    options: ExportOptions
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const filename = options.filename || `research-export-${Date.now()}`;

    switch (options.format) {
      case 'pdf':
        await this.exportToPDF(processedText, metadata, filename, options);
        break;
      case 'txt':
        this.exportToText(processedText, metadata, filename, options);
        break;
      case 'html':
        this.exportToHTML(processedText, metadata, filename, options);
        break;
      case 'json':
        this.exportToJSON(processedText, metadata, filename, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export to PDF format
   */
  private static async exportToPDF(
    processedText: ProcessedText,
    metadata: ContentMetadata | null,
    filename: string,
    options: ExportOptions
  ): Promise<void> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont(undefined, 'bold');
      } else {
        pdf.setFont(undefined, 'normal');
      }

      const lines = pdf.splitTextToSize(text, maxWidth);
      
      // Check if we need a new page
      if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * fontSize * 0.5 + 5;
    };

    // Title
    addText('Research Processing Results', 18, true);
    yPosition += 10;

    // Metadata
    if (options.includeMetadata && metadata) {
      addText('Document Information', 14, true);
      addText(`Source: ${metadata.source}`);
      addText(`Type: ${metadata.type}`);
      if (metadata.title) {
        addText(`Title: ${metadata.title}`);
      }
      if (metadata.language) {
        addText(`Language: ${metadata.language}`);
      }
      yPosition += 10;
    }

    // Timestamp
    if (options.includeTimestamp) {
      addText(`Generated: ${new Date().toLocaleString()}`);
      yPosition += 10;
    }

    // Original text
    if (processedText.original) {
      addText('Original Text', 14, true);
      addText(processedText.original);
      yPosition += 10;
    }

    // Summary
    if (processedText.summary) {
      addText('Summary', 14, true);
      addText(processedText.summary);
      yPosition += 10;
    }

    // Simplified text
    if (processedText.simplified) {
      addText('Simplified Text', 14, true);
      addText(processedText.simplified);
      yPosition += 10;
    }

    // Translation
    if (processedText.translated) {
      addText('Translation', 14, true);
      addText(processedText.translated);
      yPosition += 10;
    }

    // Proofreading results
    if (processedText.proofread) {
      addText('Proofreading Results', 14, true);
      addText('Corrected Text:', 12, true);
      addText(processedText.proofread.correctedText);
      
      if (processedText.proofread.suggestions && processedText.proofread.suggestions.length > 0) {
        addText('Suggestions:', 12, true);
        processedText.proofread.suggestions.forEach((suggestion, index) => {
          addText(`${index + 1}. ${suggestion.type}: ${suggestion.explanation}`);
        });
      }
      yPosition += 10;
    }

    // Study questions
    if (processedText.studyQuestions && processedText.studyQuestions.length > 0) {
      addText('Study Questions', 14, true);
      processedText.studyQuestions.forEach((question, index) => {
        addText(`${index + 1}. ${question.question}`, 12, true);
        
        if (question.options) {
          question.options.forEach((option, optIndex) => {
            addText(`   ${String.fromCharCode(65 + optIndex)}. ${option}`);
          });
        }
        
        if (question.correctAnswer) {
          addText(`   Answer: ${question.correctAnswer}`, 10);
        }
        
        if (question.explanation) {
          addText(`   Explanation: ${question.explanation}`, 10);
        }
        
        yPosition += 5;
      });
    }

    // Save the PDF
    pdf.save(`${filename}.pdf`);
  }

  /**
   * Export to plain text format
   */
  private static exportToText(
    processedText: ProcessedText,
    metadata: ContentMetadata | null,
    filename: string,
    options: ExportOptions
  ): void {
    let content = '';

    // Header
    content += 'RESEARCH PROCESSING RESULTS\n';
    content += '='.repeat(50) + '\n\n';

    // Metadata
    if (options.includeMetadata && metadata) {
      content += 'DOCUMENT INFORMATION\n';
      content += '-'.repeat(20) + '\n';
      content += `Source: ${metadata.source}\n`;
      content += `Type: ${metadata.type}\n`;
      if (metadata.title) content += `Title: ${metadata.title}\n`;
      if (metadata.language) content += `Language: ${metadata.language}\n`;
      content += '\n';
    }

    // Timestamp
    if (options.includeTimestamp) {
      content += `Generated: ${new Date().toLocaleString()}\n\n`;
    }

    // Original text
    if (processedText.original) {
      content += 'ORIGINAL TEXT\n';
      content += '-'.repeat(13) + '\n';
      content += processedText.original + '\n\n';
    }

    // Summary
    if (processedText.summary) {
      content += 'SUMMARY\n';
      content += '-'.repeat(7) + '\n';
      content += processedText.summary + '\n\n';
    }

    // Simplified text
    if (processedText.simplified) {
      content += 'SIMPLIFIED TEXT\n';
      content += '-'.repeat(15) + '\n';
      content += processedText.simplified + '\n\n';
    }

    // Translation
    if (processedText.translated) {
      content += 'TRANSLATION\n';
      content += '-'.repeat(11) + '\n';
      content += processedText.translated + '\n\n';
    }

    // Proofreading results
    if (processedText.proofread) {
      content += 'PROOFREADING RESULTS\n';
      content += '-'.repeat(20) + '\n';
      content += 'Corrected Text:\n';
      content += processedText.proofread.correctedText + '\n\n';
      
      if (processedText.proofread.suggestions && processedText.proofread.suggestions.length > 0) {
        content += 'Suggestions:\n';
        processedText.proofread.suggestions.forEach((suggestion, index) => {
          content += `${index + 1}. ${suggestion.type}: ${suggestion.explanation}\n`;
        });
        content += '\n';
      }
    }

    // Study questions
    if (processedText.studyQuestions && processedText.studyQuestions.length > 0) {
      content += 'STUDY QUESTIONS\n';
      content += '-'.repeat(15) + '\n';
      processedText.studyQuestions.forEach((question, index) => {
        content += `${index + 1}. ${question.question}\n`;
        
        if (question.options) {
          question.options.forEach((option, optIndex) => {
            content += `   ${String.fromCharCode(65 + optIndex)}. ${option}\n`;
          });
        }
        
        if (question.correctAnswer) {
          content += `   Answer: ${question.correctAnswer}\n`;
        }
        
        if (question.explanation) {
          content += `   Explanation: ${question.explanation}\n`;
        }
        
        content += '\n';
      });
    }

    // Create and download file
    this.downloadFile(content, `${filename}.txt`, 'text/plain');
  }

  /**
   * Export to HTML format
   */
  private static exportToHTML(
    processedText: ProcessedText,
    metadata: ContentMetadata | null,
    filename: string,
    options: ExportOptions
  ): void {
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Research Processing Results</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; border-bottom: 2px solid #333; }
        h2 { color: #666; border-bottom: 1px solid #ccc; }
        .metadata { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .section { margin: 30px 0; }
        .question { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .options { margin: 10px 0; }
        .answer { font-weight: bold; color: #007acc; }
        .explanation { font-style: italic; color: #666; }
        .suggestion { background: #fff3cd; padding: 10px; margin: 5px 0; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>Research Processing Results</h1>
`;

    // Metadata
    if (options.includeMetadata && metadata) {
      html += `
    <div class="metadata">
        <h2>Document Information</h2>
        <p><strong>Source:</strong> ${metadata.source}</p>
        <p><strong>Type:</strong> ${metadata.type}</p>
        ${metadata.title ? `<p><strong>Title:</strong> ${metadata.title}</p>` : ''}
        ${metadata.language ? `<p><strong>Language:</strong> ${metadata.language}</p>` : ''}
    </div>
`;
    }

    // Timestamp
    if (options.includeTimestamp) {
      html += `<p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>`;
    }

    // Original text
    if (processedText.original) {
      html += `
    <div class="section">
        <h2>Original Text</h2>
        <p>${processedText.original.replace(/\n/g, '<br>')}</p>
    </div>
`;
    }

    // Summary
    if (processedText.summary) {
      html += `
    <div class="section">
        <h2>Summary</h2>
        <p>${processedText.summary.replace(/\n/g, '<br>')}</p>
    </div>
`;
    }

    // Simplified text
    if (processedText.simplified) {
      html += `
    <div class="section">
        <h2>Simplified Text</h2>
        <p>${processedText.simplified.replace(/\n/g, '<br>')}</p>
    </div>
`;
    }

    // Translation
    if (processedText.translated) {
      html += `
    <div class="section">
        <h2>Translation</h2>
        <p>${processedText.translated.replace(/\n/g, '<br>')}</p>
    </div>
`;
    }

    // Proofreading results
    if (processedText.proofread) {
      html += `
    <div class="section">
        <h2>Proofreading Results</h2>
        <h3>Corrected Text</h3>
        <p>${processedText.proofread.correctedText.replace(/\n/g, '<br>')}</p>
`;
      
      if (processedText.proofread.suggestions && processedText.proofread.suggestions.length > 0) {
        html += '<h3>Suggestions</h3>';
        processedText.proofread.suggestions.forEach((suggestion, index) => {
          html += `
        <div class="suggestion">
            <strong>${suggestion.type}:</strong> ${suggestion.explanation}
        </div>
`;
        });
      }
      html += '</div>';
    }

    // Study questions
    if (processedText.studyQuestions && processedText.studyQuestions.length > 0) {
      html += `
    <div class="section">
        <h2>Study Questions</h2>
`;
      processedText.studyQuestions.forEach((question, index) => {
        html += `
        <div class="question">
            <h3>${index + 1}. ${question.question}</h3>
`;
        
        if (question.options) {
          html += '<div class="options">';
          question.options.forEach((option, optIndex) => {
            html += `<p>${String.fromCharCode(65 + optIndex)}. ${option}</p>`;
          });
          html += '</div>';
        }
        
        if (question.correctAnswer) {
          html += `<p class="answer">Answer: ${question.correctAnswer}</p>`;
        }
        
        if (question.explanation) {
          html += `<p class="explanation">Explanation: ${question.explanation}</p>`;
        }
        
        html += '</div>';
      });
      html += '</div>';
    }

    html += `
</body>
</html>
`;

    // Create and download file
    this.downloadFile(html, `${filename}.html`, 'text/html');
  }

  /**
   * Export to JSON format
   */
  private static exportToJSON(
    processedText: ProcessedText,
    metadata: ContentMetadata | null,
    filename: string,
    options: ExportOptions
  ): void {
    const exportData = {
      ...(options.includeMetadata && metadata && { metadata }),
      ...(options.includeTimestamp && { timestamp: new Date().toISOString() }),
      processedText,
      exportOptions: options
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonString, `${filename}.json`, 'application/json');
  }

  /**
   * Helper function to download a file
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Batch export multiple processed texts
   */
  static async batchExport(
    processedTexts: Array<{
      processedText: ProcessedText;
      metadata: ContentMetadata | null;
      filename?: string;
    }>,
    options: ExportOptions
  ): Promise<void> {
    for (let i = 0; i < processedTexts.length; i++) {
      const { processedText, metadata, filename } = processedTexts[i];
      const exportFilename = filename || `batch-export-${i + 1}`;
      
      await this.exportProcessedText(processedText, metadata, {
        ...options,
        filename: exportFilename
      });
      
      // Add small delay between exports to avoid overwhelming the browser
      if (i < processedTexts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
}