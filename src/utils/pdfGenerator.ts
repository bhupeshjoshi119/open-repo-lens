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
