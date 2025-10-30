import jsPDF from "jspdf";

interface Repository {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  topics?: string[];
  license?: { name: string } | null;
}

export const generateAdvancedPDFReport = async (
  repository: Repository,
  analysis: string
): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  try {
    // Add title page
    addTitlePage(pdf, repository, pageWidth, pageHeight, margin);

    // Add executive summary
    pdf.addPage();
    addExecutiveSummary(pdf, repository, analysis, pageWidth, margin);

    // Add detailed analysis
    pdf.addPage();
    addDetailedAnalysis(pdf, analysis, pageWidth, margin);

    // Add recommendations
    pdf.addPage();
    addRecommendations(pdf, analysis, pageWidth, margin);

    // Add technical appendix
    pdf.addPage();
    addTechnicalAppendix(pdf, repository, pageWidth, margin);

    // Add footer to all pages
    addFooterToAllPages(pdf, repository);

    // Save the PDF
    const repoName = repository.full_name.split('/')[1] || 'repository';
    const fileName = `${repoName}_analysis_report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    // Dispatch success event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pdf-generated', { 
        detail: { fileName, repository: repository.full_name } 
      }));
    }

  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error("Failed to generate PDF report");
  }
};

const addTitlePage = (
  pdf: jsPDF,
  repository: Repository,
  pageWidth: number,
  pageHeight: number,
  margin: number
) => {
  // Background gradient effect
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, pageHeight / 3, 'F');
  
  pdf.setFillColor(147, 51, 234);
  pdf.rect(0, pageHeight / 3, pageWidth, pageHeight / 3, 'F');

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Repository Analysis Report', pageWidth / 2, 40, { align: 'center' });

  // Repository name
  pdf.setFontSize(20);
  pdf.text(repository.full_name, pageWidth / 2, 60, { align: 'center' });

  // Date
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.text(`Generated on ${date}`, pageWidth / 2, 80, { align: 'center' });

  // Stats box
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(200, 200, 200);
  pdf.roundedRect(margin, 120, pageWidth - 2 * margin, 60, 5, 5, 'FD');

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Repository Overview', margin + 10, 135);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const stats = [
    `⭐ Stars: ${repository.stargazers_count?.toLocaleString() || 'N/A'}`,
    `🔀 Forks: ${repository.forks_count?.toLocaleString() || 'N/A'}`,
    `🐛 Issues: ${repository.open_issues_count?.toLocaleString() || 'N/A'}`,
    `📝 Language: ${repository.language || 'N/A'}`
  ];

  stats.forEach((stat, index) => {
    pdf.text(stat, margin + 10, 150 + (index * 8));
  });

  // Description with proper wrapping
  if (repository.description) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(60, 60, 60);
    
    // Limit description length and wrap text properly
    const maxDescLength = 200;
    const description = repository.description.length > maxDescLength 
      ? repository.description.substring(0, maxDescLength) + '...' 
      : repository.description;
    
    const wrappedDescription = pdf.splitTextToSize(description, pageWidth - 2 * margin - 20);
    let descY = 200;
    
    wrappedDescription.forEach((line: string) => {
      pdf.text(line, pageWidth / 2, descY, { align: 'center' });
      descY += 6;
    });
  }
};

const addExecutiveSummary = (
  pdf: jsPDF,
  repository: Repository,
  analysis: string,
  pageWidth: number,
  margin: number
) => {
  let currentY = 30;
  const maxWidth = pageWidth - 2 * margin;
  const lineHeight = 6;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', margin, currentY);
  currentY += 20;

  // Extract health score
  const healthScoreMatch = analysis.match(/health score[:\s]+(\d+)/i);
  const healthScore = healthScoreMatch ? parseInt(healthScoreMatch[1]) : 75;

  // Health score section
  pdf.setFillColor(240, 240, 240);
  pdf.roundedRect(margin, currentY, maxWidth, 30, 3, 3, 'F');
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Repository Health Score', margin + 10, currentY + 15);
  
  // Score bar
  const barWidth = (maxWidth - 20) * (healthScore / 100);
  const color = healthScore >= 80 ? [34, 197, 94] : healthScore >= 60 ? [59, 130, 246] : [239, 68, 68];
  pdf.setFillColor(color[0], color[1], color[2]);
  pdf.rect(margin + 10, currentY + 20, barWidth, 5, 'F');
  
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${healthScore}/100`, pageWidth - margin - 30, currentY + 25);
  currentY += 40;

  // Key findings
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Key Findings', margin, currentY);
  currentY += 15;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const keyPoints = extractKeyPoints(analysis);
  keyPoints.forEach((point) => {
    // Ensure proper text wrapping for each bullet point
    const bulletText = `• ${point}`;
    const requiredHeight = Math.ceil(bulletText.length / 80) * lineHeight + 3;
    
    currentY = checkPageBreak(pdf, currentY, requiredHeight);
    currentY = addWrappedText(pdf, bulletText, margin + 5, currentY, maxWidth - 10, lineHeight);
    currentY += 3; // Extra spacing between bullet points
  });
};

const addDetailedAnalysis = (
  pdf: jsPDF,
  analysis: string,
  pageWidth: number,
  margin: number
) => {
  let currentY = 30;
  const maxWidth = pageWidth - 2 * margin;
  const lineHeight = 5;
  const sectionSpacing = 15;

  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Detailed Analysis', margin, currentY);
  currentY += 25;

  const sections = analysis.split(/##\s+/).filter(Boolean);

  sections.forEach((section, sectionIndex) => {
    const [title, ...content] = section.split('\n');
    const cleanTitle = title.trim();
    const contentText = content.join(' ').trim();

    // Check if we need a new page for the section title
    if (currentY > 250) {
      pdf.addPage();
      currentY = 30;
    }

    // Section title with background
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(margin, currentY - 5, maxWidth, 12, 2, 2, 'F');
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text(cleanTitle, margin + 5, currentY + 3);
    currentY += 15;

    // Section content
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    if (contentText) {
      // Split content into paragraphs
      const paragraphs = contentText.split(/\n\s*\n/).filter(p => p.trim());
      
      paragraphs.forEach((paragraph, paragraphIndex) => {
        const cleanParagraph = paragraph.replace(/\s+/g, ' ').trim();
        const wrappedLines = pdf.splitTextToSize(cleanParagraph, maxWidth - 10);
        
        // Check if we need a new page
        if (currentY + (wrappedLines.length * lineHeight) > 270) {
          pdf.addPage();
          currentY = 30;
        }
        
        wrappedLines.forEach((line: string) => {
          pdf.text(line, margin + 5, currentY);
          currentY += lineHeight;
        });
        
        // Add spacing between paragraphs
        if (paragraphIndex < paragraphs.length - 1) {
          currentY += 3;
        }
      });
    }
    
    // Add spacing between sections
    if (sectionIndex < sections.length - 1) {
      currentY += sectionSpacing;
    }
  });
};

const addRecommendations = (
  pdf: jsPDF,
  analysis: string,
  pageWidth: number,
  margin: number
) => {
  let currentY = 30;
  const maxWidth = pageWidth - 2 * margin;
  const lineHeight = 5;

  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Recommendations', margin, currentY);
  currentY += 25;

  const recommendations = extractRecommendations(analysis);
  
  recommendations.forEach((rec, index) => {
    // Priority indicator
    const priority = index < 3 ? 'High' : index < 6 ? 'Medium' : 'Low';
    const priorityColor = priority === 'High' ? [239, 68, 68] : 
                         priority === 'Medium' ? [245, 158, 11] : [34, 197, 94];
    
    // Calculate text height needed
    const recText = `${index + 1}. ${rec}`;
    const wrappedLines = pdf.splitTextToSize(recText, maxWidth - 45);
    const boxHeight = Math.max(15, wrappedLines.length * lineHeight + 8);
    
    // Check if we need a new page
    if (currentY + boxHeight > 270) {
      pdf.addPage();
      currentY = 30;
    }
    
    // Recommendation box with proper height
    pdf.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2], 0.1);
    pdf.setDrawColor(priorityColor[0], priorityColor[1], priorityColor[2]);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin, currentY, maxWidth, boxHeight, 3, 3, 'FD');
    
    // Priority badge
    pdf.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
    pdf.roundedRect(margin + 5, currentY + 3, 30, 10, 2, 2, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text(priority, margin + 8, currentY + 9);
    
    // Recommendation text with proper wrapping
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    let textY = currentY + 8;
    wrappedLines.forEach((line: string) => {
      pdf.text(line, margin + 40, textY);
      textY += lineHeight;
    });
    
    currentY += boxHeight + 8; // Add spacing between recommendations
  });
};

const addTechnicalAppendix = (
  pdf: jsPDF,
  repository: Repository,
  pageWidth: number,
  margin: number
) => {
  let currentY = 30;
  const maxWidth = pageWidth - 2 * margin;
  const lineHeight = 5;

  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Technical Appendix', margin, currentY);
  currentY += 25;

  // Repository metadata section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Repository Metadata', margin, currentY);
  currentY += 15;

  const metadata = [
    ['Full Name', repository.full_name],
    ['Created Date', new Date(repository.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })],
    ['Last Updated', new Date(repository.updated_at).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })],
    ['Primary Language', repository.language || 'Not specified'],
    ['License', repository.license?.name || 'No license specified'],
    ['Repository URL', repository.html_url]
  ];

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  metadata.forEach(([key, value]) => {
    currentY = checkPageBreak(pdf, currentY, 8);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${key}:`, margin, currentY);
    
    pdf.setFont('helvetica', 'normal');
    const valueText = value.length > 60 ? value.substring(0, 60) + '...' : value;
    currentY = addWrappedText(pdf, valueText, margin + 60, currentY, maxWidth - 60, lineHeight);
    currentY += 3;
  });

  currentY += 10;

  // Topics section
  if (repository.topics && repository.topics.length > 0) {
    currentY = checkPageBreak(pdf, currentY, 20);
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Topics', margin, currentY);
    currentY += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const topicsText = repository.topics.join(', ');
    currentY = addWrappedText(pdf, topicsText, margin, currentY, maxWidth, lineHeight);
    currentY += 15;
  }

  // Analysis methodology
  currentY = checkPageBreak(pdf, currentY, 40);
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Analysis Methodology', margin, currentY);
  currentY += 15;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const methodology = [
    'Repository data collected via GitHub REST API v3',
    'AI-powered analysis using advanced natural language processing',
    'Health score calculated based on multiple factors including activity, community engagement, and code quality indicators',
    'Recommendations generated from industry best practices and repository-specific analysis',
    'Report generated using TechHub AI platform with professional PDF formatting'
  ];

  methodology.forEach((item) => {
    currentY = checkPageBreak(pdf, currentY, 10);
    currentY = addWrappedText(pdf, `• ${item}`, margin, currentY, maxWidth, lineHeight);
    currentY += 3;
  });
};

const addFooterToAllPages = (pdf: jsPDF, repository: Repository) => {
  const pageCount = pdf.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    // Footer line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 280, pdf.internal.pageSize.getWidth() - 20, 280);
    
    // Footer text
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${repository.full_name} - Analysis Report`, 20, 285);
    pdf.text(`Page ${i} of ${pageCount}`, pdf.internal.pageSize.getWidth() - 20, 285, { align: 'right' });
    pdf.text(`Generated by TechHub AI`, pdf.internal.pageSize.getWidth() / 2, 285, { align: 'center' });
  }
};

const extractKeyPoints = (analysis: string): string[] => {
  const points: string[] = [];
  
  // Look for bullet points
  const bulletMatches = analysis.match(/[•\-\*]\s+([^\n]+)/g);
  if (bulletMatches) {
    points.push(...bulletMatches.map(match => match.replace(/[•\-\*]\s+/, '').trim()).slice(0, 5));
  }
  
  // Look for key sentences
  const keyIndicators = ['critical', 'important', 'significant', 'major', 'key', 'primary'];
  const sentences = analysis.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    if (keyIndicators.some(indicator => sentence.toLowerCase().includes(indicator))) {
      points.push(sentence.trim());
    }
  });
  
  return points.slice(0, 6);
};

// Helper function for adding wrapped text with proper spacing
const addWrappedText = (
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 5
): number => {
  const lines = pdf.splitTextToSize(text, maxWidth);
  let currentY = y;
  
  lines.forEach((line: string) => {
    pdf.text(line, x, currentY);
    currentY += lineHeight;
  });
  
  return currentY;
};

// Helper function to check if we need a new page
const checkPageBreak = (pdf: jsPDF, currentY: number, requiredHeight: number): number => {
  if (currentY + requiredHeight > 270) {
    pdf.addPage();
    return 30; // Reset to top margin
  }
  return currentY;
};

const extractRecommendations = (analysis: string): string[] => {
  const defaultRecommendations = [
    "Implement comprehensive automated testing suite with unit, integration, and end-to-end tests",
    "Improve documentation with clear README, API docs, and contribution guidelines",
    "Establish clear contribution guidelines and code of conduct for community engagement",
    "Set up issue templates and labels for better organization and triage",
    "Consider implementing security scanning tools and vulnerability management",
    "Regular dependency updates and vulnerability checks with automated tools",
    "Implement continuous integration and deployment pipelines for better workflow",
    "Add code quality checks, linting rules, and formatting standards"
  ];
  
  // Try to extract actual recommendations
  const recSection = analysis.match(/recommendations?[:\s]+([\s\S]*?)(?=##|$)/i);
  if (recSection) {
    const extractedRecs = recSection[1].match(/[•\-\*]\s+([^\n]+)/g);
    if (extractedRecs) {
      return extractedRecs.map(rec => rec.replace(/[•\-\*]\s+/, '').trim()).slice(0, 8);
    }
  }
  
  return defaultRecommendations;
};