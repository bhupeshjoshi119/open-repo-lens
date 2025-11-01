import jsPDF from 'jspdf';
import { ProofreadResult, Suggestion } from '@/types/chromeAi';

interface ProofreadingPDFData {
  originalText: string;
  correctedText: string;
  suggestions: Suggestion[];
  metrics: {
    readabilityScore: number;
    grammarIssues: number;
    styleIssues: number;
  };
}

export const generateProofreadingPDF = async (data: ProofreadingPDFData): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number): string[] => {
    return doc.splitTextToSize(text, maxWidth);
  };

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Proofreading Report', margin, yPosition);
  yPosition += 15;

  // Timestamp
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 15;

  // Metrics Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Analysis Metrics', margin, yPosition);
  yPosition += 10;

  // Metrics boxes
  const boxWidth = (contentWidth - 10) / 3;
  const boxHeight = 30;
  const boxY = yPosition;

  // Readability Score
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, boxY, boxWidth, boxHeight, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Readability Score', margin + 5, boxY + 10);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const scoreColor = data.metrics.readabilityScore >= 80 ? [34, 197, 94] : 
                     data.metrics.readabilityScore >= 60 ? [234, 179, 8] : [239, 68, 68];
  doc.setTextColor(...scoreColor);
  doc.text(`${data.metrics.readabilityScore}/100`, margin + 5, boxY + 25);

  // Grammar Issues
  doc.setFillColor(240, 240, 240);
  doc.rect(margin + boxWidth + 5, boxY, boxWidth, boxHeight, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Grammar Issues', margin + boxWidth + 10, boxY + 10);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(239, 68, 68);
  doc.text(`${data.metrics.grammarIssues}`, margin + boxWidth + 10, boxY + 25);

  // Style Issues
  doc.setFillColor(240, 240, 240);
  doc.rect(margin + (boxWidth + 5) * 2, boxY, boxWidth, boxHeight, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Style Issues', margin + (boxWidth + 5) * 2 + 5, boxY + 10);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 179, 8);
  doc.text(`${data.metrics.styleIssues}`, margin + (boxWidth + 5) * 2 + 5, boxY + 25);

  yPosition += boxHeight + 20;
  checkPageBreak();

  // Original Text Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Original Text', margin, yPosition);
  yPosition += 10;

  doc.setFillColor(254, 226, 226); // Light red background
  const originalTextLines = wrapText(data.originalText, contentWidth - 10);
  const originalTextHeight = (originalTextLines.length * 5) + 10;
  
  checkPageBreak(originalTextHeight);
  doc.rect(margin, yPosition, contentWidth, originalTextHeight, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  originalTextLines.forEach((line, index) => {
    doc.text(line, margin + 5, yPosition + 8 + (index * 5));
  });
  
  yPosition += originalTextHeight + 15;
  checkPageBreak();

  // Corrected Text Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Corrected Text', margin, yPosition);
  yPosition += 10;

  doc.setFillColor(220, 252, 231); // Light green background
  const correctedTextLines = wrapText(data.correctedText, contentWidth - 10);
  const correctedTextHeight = (correctedTextLines.length * 5) + 10;
  
  checkPageBreak(correctedTextHeight);
  doc.rect(margin, yPosition, contentWidth, correctedTextHeight, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  correctedTextLines.forEach((line, index) => {
    doc.text(line, margin + 5, yPosition + 8 + (index * 5));
  });
  
  yPosition += correctedTextHeight + 15;
  checkPageBreak();

  // Suggestions Section
  if (data.suggestions.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Suggestions', margin, yPosition);
    yPosition += 10;

    data.suggestions.forEach((suggestion, index) => {
      checkPageBreak(40);

      // Suggestion number and type
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${suggestion.type.toUpperCase()}`, margin, yPosition);
      yPosition += 8;

      // Original text
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Original:', margin + 5, yPosition);
      yPosition += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      const originalLines = wrapText(suggestion.original, contentWidth - 10);
      originalLines.forEach(line => {
        doc.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 2;

      // Suggested text
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Suggested:', margin + 5, yPosition);
      yPosition += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(34, 197, 94);
      const suggestedLines = wrapText(suggestion.suggested, contentWidth - 10);
      suggestedLines.forEach(line => {
        doc.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 2;

      // Explanation
      if (suggestion.explanation) {
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'italic');
        doc.text('Explanation:', margin + 5, yPosition);
        yPosition += 5;
        
        const explanationLines = wrapText(suggestion.explanation, contentWidth - 10);
        explanationLines.forEach(line => {
          doc.text(line, margin + 5, yPosition);
          yPosition += 5;
        });
      }

      doc.setTextColor(0, 0, 0);
      yPosition += 8;
    });
  } else {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(34, 197, 94);
    doc.text('✓ No issues found! Your text is excellent.', margin, yPosition);
    yPosition += 10;
  }

  // Footer on last page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages} | Generated by AI Proofreading Studio`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `proofreading-report-${Date.now()}.pdf`;
  doc.save(filename);
};

// Export function for repository analysis PDFs (existing functionality)
export const generateRepositoryPDF = async (repository: any, analysis: any): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Repository Analysis Report', margin, yPosition);
  yPosition += 15;

  // Repository name
  doc.setFontSize(14);
  doc.text(repository.full_name || 'Unknown Repository', margin, yPosition);
  yPosition += 10;

  // Timestamp
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 15;

  // Analysis content
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  if (analysis.summary) {
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', margin, yPosition);
    yPosition += 7;
    
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(analysis.summary, pageWidth - (margin * 2));
    summaryLines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 10;
  }

  // Health Score
  if (analysis.healthScore) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Health Score: ${analysis.healthScore}/100`, margin, yPosition);
    yPosition += 10;
  }

  // Save
  const filename = `repository-analysis-${Date.now()}.pdf`;
  doc.save(filename);
};

/**
 * Generate comprehensive AI analysis report PDF for any AI tool
 */
export const generateAiAnalysisReport = async (data: {
  title: string;
  type: 'repository' | 'image' | 'predictive' | 'text-analysis';
  content: any;
  timestamp?: Date;
}): Promise<void> => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Header with branding
  pdf.setFillColor(59, 130, 246); // Primary blue
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TechHub AI Analysis Report', margin, 25);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${(data.timestamp || new Date()).toLocaleString()}`, pageWidth - margin - 60, 25);
  
  yPosition = 60;
  pdf.setTextColor(0, 0, 0);

  // Title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.title, margin, yPosition);
  yPosition += 20;

  // Type-specific content generation
  switch (data.type) {
    case 'repository':
      await generateRepositoryAnalysisContent(pdf, data.content, margin, yPosition, pageWidth, checkPageBreak);
      break;
    case 'image':
      await generateImageAnalysisContent(pdf, data.content, margin, yPosition, pageWidth, checkPageBreak);
      break;
    case 'predictive':
      await generatePredictiveAnalysisContent(pdf, data.content, margin, yPosition, pageWidth, checkPageBreak);
      break;
    case 'text-analysis':
      await generateTextAnalysisContent(pdf, data.content, margin, yPosition, pageWidth, checkPageBreak);
      break;
  }

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    pdf.text('Generated by TechHub AI Tools - Privacy-First AI Analysis', margin, pageHeight - 10);
  }

  // Save the PDF
  const filename = `techhub-${data.type}-analysis-${Date.now()}.pdf`;
  pdf.save(filename);
};

const generateRepositoryAnalysisContent = async (
  pdf: jsPDF,
  data: any,
  margin: number,
  yPos: number,
  pageWidth: number,
  checkPageBreak: (space?: number) => boolean
): Promise<void> => {
  let yPosition = yPos;

  // Repository Info
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Repository Information', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const repoInfo = [
    `Name: ${data.repository?.full_name || 'N/A'}`,
    `Language: ${data.repository?.language || 'N/A'}`,
    `Stars: ${data.repository?.stargazers_count?.toLocaleString() || 'N/A'}`,
    `Forks: ${data.repository?.forks_count?.toLocaleString() || 'N/A'}`,
    `Issues: ${data.repository?.open_issues_count?.toLocaleString() || 'N/A'}`
  ];

  repoInfo.forEach(info => {
    checkPageBreak();
    pdf.text(info, margin, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // AI Analysis Results
  if (data.analysis) {
    checkPageBreak(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI Analysis Results', margin, yPosition);
    yPosition += 15;

    // Health Score
    if (data.analysis.healthScore) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Health Score: ${data.analysis.healthScore}/100`, margin, yPosition);
      yPosition += 10;
    }

    // Summary
    if (data.analysis.summary) {
      checkPageBreak(30);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Summary:', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const summaryLines = pdf.splitTextToSize(data.analysis.summary, pageWidth - margin * 2);
      summaryLines.forEach((line: string) => {
        checkPageBreak();
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      yPosition += 10;
    }

    // Use Cases
    if (data.analysis.useCases && data.analysis.useCases.length > 0) {
      checkPageBreak(20);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Potential Use Cases:', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      data.analysis.useCases.forEach((useCase: string) => {
        checkPageBreak();
        pdf.text(`• ${useCase}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }
  }
};

const generateImageAnalysisContent = async (
  pdf: jsPDF,
  data: any,
  margin: number,
  yPos: number,
  pageWidth: number,
  checkPageBreak: (space?: number) => boolean
): Promise<void> => {
  let yPosition = yPos;

  // Image Metadata
  if (data.metadata) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Image Information', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const imageInfo = [
      `Dimensions: ${data.metadata.width} × ${data.metadata.height}`,
      `Format: ${data.metadata.format}`,
      `File Size: ${(data.metadata.size / 1024 / 1024).toFixed(2)} MB`
    ];

    imageInfo.forEach(info => {
      checkPageBreak();
      pdf.text(info, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }

  // AI Description
  if (data.description) {
    checkPageBreak(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI Description', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const descLines = pdf.splitTextToSize(data.description, pageWidth - margin * 2);
    descLines.forEach((line: string) => {
      checkPageBreak();
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 10;
  }

  // Objects Detected
  if (data.objects && data.objects.length > 0) {
    checkPageBreak(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Objects Detected', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    data.objects.forEach((obj: any) => {
      checkPageBreak();
      pdf.text(`• ${obj.name} (${Math.round(obj.confidence * 100)}% confidence)`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }

  // Classification
  if (data.classification) {
    checkPageBreak(15);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Classification', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Category: ${data.classification.category}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Confidence: ${Math.round(data.classification.confidence * 100)}%`, margin, yPosition);
    yPosition += 10;
  }
};

const generatePredictiveAnalysisContent = async (
  pdf: jsPDF,
  data: any,
  margin: number,
  yPos: number,
  pageWidth: number,
  checkPageBreak: (space?: number) => boolean
): Promise<void> => {
  let yPosition = yPos;

  // Prediction Summary
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Prediction Summary', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  if (data.predictions && data.predictions.length > 0) {
    const initial = data.predictions[0]?.value || 0;
    const final = data.predictions[data.predictions.length - 1]?.value || 0;
    const change = ((final - initial) / initial * 100).toFixed(1);
    
    const summaryInfo = [
      `Analysis Type: ${data.type || 'N/A'}`,
      `Timeframe: ${data.timeframe || 'N/A'}`,
      `Confidence: ${Math.round((data.confidence || 0) * 100)}%`,
      `Current Value: ${initial.toLocaleString()}`,
      `Predicted Value: ${final.toLocaleString()}`,
      `Expected Change: ${change}%`
    ];

    summaryInfo.forEach(info => {
      checkPageBreak();
      pdf.text(info, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }

  // Key Insights
  if (data.insights && data.insights.length > 0) {
    checkPageBreak(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Insights', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    data.insights.forEach((insight: string) => {
      checkPageBreak();
      const insightLines = pdf.splitTextToSize(`• ${insight}`, pageWidth - margin * 2 - 10);
      insightLines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 2;
    });
    yPosition += 10;
  }

  // Recommendations
  if (data.recommendations && data.recommendations.length > 0) {
    checkPageBreak(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommendations', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    data.recommendations.forEach((rec: string) => {
      checkPageBreak();
      const recLines = pdf.splitTextToSize(`• ${rec}`, pageWidth - margin * 2 - 10);
      recLines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 2;
    });
  }
};

const generateTextAnalysisContent = async (
  pdf: jsPDF,
  data: any,
  margin: number,
  yPos: number,
  pageWidth: number,
  checkPageBreak: (space?: number) => boolean
): Promise<void> => {
  let yPosition = yPos;

  // Original Text
  if (data.originalText) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Original Text', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const originalLines = pdf.splitTextToSize(data.originalText, pageWidth - margin * 2);
    originalLines.forEach((line: string) => {
      checkPageBreak();
      pdf.text(line, margin, yPosition);
      yPosition += 4;
    });
    yPosition += 10;
  }

  // Processed Text
  if (data.processedText) {
    checkPageBreak(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI-Processed Text', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const processedLines = pdf.splitTextToSize(data.processedText, pageWidth - margin * 2);
    processedLines.forEach((line: string) => {
      checkPageBreak();
      pdf.text(line, margin, yPosition);
      yPosition += 4;
    });
    yPosition += 10;
  }

  // Analysis Results
  if (data.analysisType) {
    checkPageBreak(15);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${data.analysisType} Analysis`, margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Processing completed successfully using Chrome AI`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Analysis performed locally for privacy protection`, margin, yPosition);
  }
};