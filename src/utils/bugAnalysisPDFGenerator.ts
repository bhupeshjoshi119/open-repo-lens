import jsPDF from "jspdf";

interface BugAnalysisData {
  image: string;
  fileName: string;
  analysis: any;
  technicalDetails?: any;
  timestamp: string;
}

export const generateBugAnalysisPDF = async (data: BugAnalysisData): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  try {
    // Add title page
    addBugReportTitlePage(pdf, data, pageWidth, pageHeight, margin);

    // Add executive summary
    pdf.addPage();
    addExecutiveSummary(pdf, data, pageWidth, margin);

    // Add detailed analysis
    pdf.addPage();
    addDetailedBugAnalysis(pdf, data, pageWidth, margin);

    // Add root cause analysis
    pdf.addPage();
    addRootCauseAnalysis(pdf, data, pageWidth, margin);

    // Add solutions and recommendations
    pdf.addPage();
    addSolutionsAndRecommendations(pdf, data, pageWidth, margin);

    // Add prevention strategies
    pdf.addPage();
    addPreventionStrategies(pdf, data, pageWidth, margin);

    // Add technical appendix
    pdf.addPage();
    addTechnicalAppendix(pdf, data, pageWidth, margin);

    // Add footer to all pages
    addFooterToAllPages(pdf, data);

    // Save the PDF
    const fileName = `bug_analysis_report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    // Dispatch success event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bug-report-generated', { 
        detail: { fileName, bugType: data.analysis.bugType, severity: data.analysis.severity } 
      }));
    }

  } catch (error) {
    console.error("Bug analysis PDF generation error:", error);
    throw new Error("Failed to generate bug analysis PDF report");
  }
};

const addBugReportTitlePage = (
  pdf: jsPDF,
  data: BugAnalysisData,
  pageWidth: number,
  pageHeight: number,
  margin: number
) => {
  // Background gradient based on severity
  const severityColors = {
    critical: { primary: [220, 38, 38], secondary: [185, 28, 28] },
    high: { primary: [234, 88, 12], secondary: [194, 65, 12] },
    medium: { primary: [245, 158, 11], secondary: [217, 119, 6] },
    low: { primary: [34, 197, 94], secondary: [22, 163, 74] }
  };

  const colors = severityColors[data.analysis.severity as keyof typeof severityColors] || severityColors.medium;
  
  pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  pdf.rect(0, 0, pageWidth, pageHeight / 3, 'F');
  
  pdf.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  pdf.rect(0, pageHeight / 3, pageWidth, pageHeight / 3, 'F');

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bug Analysis Report', pageWidth / 2, 40, { align: 'center' });

  // Severity badge
  pdf.setFontSize(18);
  pdf.text(`${data.analysis.severity.toUpperCase()} SEVERITY`, pageWidth / 2, 60, { align: 'center' });

  // Bug type
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.analysis.bugType, pageWidth / 2, 80, { align: 'center' });

  // Timestamp
  pdf.setFontSize(12);
  const date = new Date(data.timestamp).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  pdf.text(`Generated on ${date}`, pageWidth / 2, 100, { align: 'center' });

  // Summary box
  pdf.setFillColor(255, 255, 255, 0.95);
  pdf.setDrawColor(255, 255, 255);
  pdf.roundedRect(margin, 130, pageWidth - 2 * margin, 80, 8, 8, 'FD');

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Analysis Summary', pageWidth / 2, 150, { align: 'center' });

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const description = data.analysis.description;
  const wrappedDescription = pdf.splitTextToSize(description, pageWidth - 2 * margin - 20);
  let descY = 165;
  
  wrappedDescription.forEach((line: string) => {
    pdf.text(line, pageWidth / 2, descY, { align: 'center' });
    descY += 6;
  });

  // Confidence score
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Confidence: ${Math.round(data.analysis.confidence * 100)}%`, pageWidth / 2, descY + 10, { align: 'center' });

  // Image info
  if (data.fileName) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Source: ${data.fileName}`, pageWidth / 2, 250, { align: 'center' });
  }
};

const addExecutiveSummary = (
  pdf: jsPDF,
  data: BugAnalysisData,
  pageWidth: number,
  margin: number
) => {
  let currentY = 30;
  const maxWidth = pageWidth - 2 * margin;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', margin, currentY);
  currentY += 25;

  // Issue overview
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, currentY, maxWidth, 40, 5, 5, 'F');
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Issue Overview', margin + 10, currentY + 15);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const overviewText = `A ${data.analysis.severity} severity ${data.analysis.bugType.toLowerCase()} has been detected with ${Math.round(data.analysis.confidence * 100)}% confidence. This issue requires ${data.analysis.severity === 'critical' ? 'immediate' : data.analysis.severity === 'high' ? 'urgent' : 'timely'} attention to prevent impact on system functionality and user experience.`;
  
  const wrappedOverview = pdf.splitTextToSize(overviewText, maxWidth - 20);
  let overviewY = currentY + 25;
  
  wrappedOverview.forEach((line: string) => {
    pdf.text(line, margin + 10, overviewY);
    overviewY += 5;
  });
  
  currentY += 50;

  // Impact assessment
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Impact Assessment', margin, currentY);
  currentY += 15;

  const impacts = getImpactAssessment(data.analysis.bugType, data.analysis.severity);
  impacts.forEach((impact) => {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const impactText = `• ${impact}`;
    const wrappedImpact = pdf.splitTextToSize(impactText, maxWidth - 10);
    
    wrappedImpact.forEach((line: string) => {
      if (currentY > 270) {
        pdf.addPage();
        currentY = 30;
      }
      pdf.text(line, margin + 5, currentY);
      currentY += 5;
    });
    currentY += 2;
  });

  currentY += 10;

  // Recommended actions
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Immediate Actions Required', margin, currentY);
  currentY += 15;

  const immediateActions = data.analysis.solutions
    .filter((solution: any) => solution.priority === 'immediate')
    .slice(0, 3);

  if (immediateActions.length === 0) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('• Review detailed analysis and implement recommended solutions', margin + 5, currentY);
  } else {
    immediateActions.forEach((action: any) => {
      if (currentY > 270) {
        pdf.addPage();
        currentY = 30;
      }
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`• ${action.title}`, margin + 5, currentY);
      currentY += 6;
      
      pdf.setFont('helvetica', 'normal');
      const actionDesc = pdf.splitTextToSize(action.description, maxWidth - 15);
      actionDesc.forEach((line: string) => {
        pdf.text(line, margin + 10, currentY);
        currentY += 5;
      });
      currentY += 3;
    });
  }
};

const addDetailedBugAnalysis = (
  pdf: jsPDF,
  data: BugAnalysisData,
  pageWidth: number,
  margin: number
) => {
  let currentY = 30;
  const maxWidth = pageWidth - 2 * margin;

  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Detailed Bug Analysis', margin, currentY);
  currentY += 25;

  // Bug classification
  pdf.setFillColor(59, 130, 246, 0.1);
  pdf.roundedRect(margin, currentY, maxWidth, 35, 5, 5, 'F');
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bug Classification', margin + 10, currentY + 15);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Type: ${data.analysis.bugType}`, margin + 10, currentY + 25);
  pdf.text(`Severity: ${data.analysis.severity.toUpperCase()}`, margin + 100, currentY + 25);
  pdf.text(`Confidence: ${Math.round(data.analysis.confidence * 100)}%`, margin + 10, currentY + 32);
  
  currentY += 45;

  // Description
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Description', margin, currentY);
  currentY += 15;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const descriptionLines = pdf.splitTextToSize(data.analysis.description, maxWidth);
  descriptionLines.forEach((line: string) => {
    if (currentY > 270) {
      pdf.addPage();
      currentY = 30;
    }
    pdf.text(line, margin, currentY);
    currentY += 5;
  });

  currentY += 15;

  // Technical details
  if (data.technicalDetails) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Technical Details', margin, currentY);
    currentY += 15;

    const techDetails = [
      ['Image Dimensions', `${data.technicalDetails.width} × ${data.technicalDetails.height}`],
      ['File Format', data.technicalDetails.format],
      ['File Size', data.technicalDetails.size],
      ['Color Space', data.technicalDetails.colorSpace]
    ];

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    techDetails.forEach(([key, value]) => {
      if (currentY > 270) {
        pdf.addPage();
        currentY = 30;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${key}:`, margin, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, margin + 60, currentY);
      currentY += 8;
    });
  }
};

const addRootCauseAnalysis = (
  pdf: jsPDF,
  data: BugAnalysisData,
  pageWidth: number,
  margin: number
) => {
  let currentY = 30;
  const maxWidth = pageWidth - 2 * margin;

  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Root Cause Analysis', margin, currentY);
  currentY += 25;

  if (!data.analysis.rootCause) return;

  // Primary cause
  pdf.setFillColor(220, 38, 38, 0.1);
  pdf.roundedRect(margin, currentY, maxWidth, 25, 5, 5, 'F');
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Primary Cause', margin + 10, currentY + 15);
  currentY += 35;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const primaryCauseLines = pdf.splitTextToSize(data.analysis.rootCause.primary, maxWidth);
  primaryCauseLines.forEach((line: string) => {
    pdf.text(line, margin, currentY);
    currentY += 5;
  });

  currentY += 15;

  // Contributing factors
  if (data.analysis.rootCause.contributing) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Contributing Factors', margin, currentY);
    currentY += 15;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    data.analysis.rootCause.contributing.forEach((factor: string) => {
      if (currentY > 270) {
        pdf.addPage();
        currentY = 30;
      }
      
      const factorText = `• ${factor}`;
      const wrappedFactor = pdf.splitTextToSize(factorText, maxWidth - 10);
      
      wrappedFactor.forEach((line: string) => {
        pdf.text(line, margin + 5, currentY);
        currentY += 5;
      });
      currentY += 2;
    });
  }
};

const addSolutionsAndRecommendations = (
  pdf: jsPDF,
  data: BugAnalysisData,
  pageWidth: number,
  margin: number
) => {
  let currentY = 30;
  const maxWidth = pageWidth - 2 * margin;

  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Solutions & Recommendations', margin, currentY);
  currentY += 25;

  if (!data.analysis.solutions) return;

  data.analysis.solutions.forEach((solution: any, index: number) => {
    // Check if we need a new page
    if (currentY > 220) {
      pdf.addPage();
      currentY = 30;
    }

    // Priority color coding
    const priorityColors = {
      immediate: [220, 38, 38],
      high: [234, 88, 12],
      medium: [245, 158, 11],
      low: [34, 197, 94]
    };

    const color = priorityColors[solution.priority as keyof typeof priorityColors] || priorityColors.medium;

    // Solution box
    pdf.setFillColor(color[0], color[1], color[2], 0.1);
    pdf.setDrawColor(color[0], color[1], color[2]);
    pdf.roundedRect(margin, currentY, maxWidth, 15, 3, 3, 'FD');

    // Priority badge
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.roundedRect(margin + 5, currentY + 3, 35, 9, 2, 2, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text(solution.priority.toUpperCase(), margin + 7, currentY + 8);

    // Solution title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${index + 1}. ${solution.title}`, margin + 45, currentY + 10);

    currentY += 20;

    // Description
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const descLines = pdf.splitTextToSize(solution.description, maxWidth - 10);
    descLines.forEach((line: string) => {
      pdf.text(line, margin + 5, currentY);
      currentY += 5;
    });

    currentY += 5;

    // Steps
    if (solution.steps) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Implementation Steps:', margin + 5, currentY);
      currentY += 8;

      pdf.setFont('helvetica', 'normal');
      solution.steps.forEach((step: string, stepIndex: number) => {
        if (currentY > 270) {
          pdf.addPage();
          currentY = 30;
        }
        
        const stepText = `${stepIndex + 1}. ${step}`;
        const stepLines = pdf.splitTextToSize(stepText, maxWidth - 20);
        
        stepLines.forEach((line: string) => {
          pdf.text(line, margin + 10, currentY);
          currentY += 4;
        });
        currentY += 2;
      });
    }

    currentY += 10;
  });
};

const addPreventionStrategies = (
  pdf: jsPDF,
  data: BugAnalysisData,
  pageWidth: number,
  margin: number
) => {
  let currentY = 30;
  const maxWidth = pageWidth - 2 * margin;

  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Prevention Strategies', margin, currentY);
  currentY += 25;

  if (!data.analysis.prevention) return;

  // Introduction
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const introText = 'Implementing these prevention strategies will help avoid similar issues in the future and improve overall system reliability.';
  const introLines = pdf.splitTextToSize(introText, maxWidth);
  
  introLines.forEach((line: string) => {
    pdf.text(line, margin, currentY);
    currentY += 5;
  });

  currentY += 15;

  // Prevention tips
  data.analysis.prevention.forEach((tip: string, index: number) => {
    if (currentY > 270) {
      pdf.addPage();
      currentY = 30;
    }

    // Tip box
    pdf.setFillColor(34, 197, 94, 0.1);
    pdf.setDrawColor(34, 197, 94);
    pdf.roundedRect(margin, currentY - 3, maxWidth, 12, 2, 2, 'FD');

    // Checkmark
    pdf.setFillColor(34, 197, 94);
    pdf.circle(margin + 8, currentY + 2, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('✓', margin + 6.5, currentY + 3);

    // Tip text
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const tipLines = pdf.splitTextToSize(tip, maxWidth - 25);
    let tipY = currentY + 3;
    
    tipLines.forEach((line: string) => {
      pdf.text(line, margin + 15, tipY);
      tipY += 5;
    });

    currentY += Math.max(12, tipLines.length * 5 + 3);
  });
};

const addTechnicalAppendix = (
  pdf: jsPDF,
  data: BugAnalysisData,
  pageWidth: number,
  margin: number
) => {
  let currentY = 30;
  const maxWidth = pageWidth - 2 * margin;

  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Technical Appendix', margin, currentY);
  currentY += 25;

  // Analysis metadata
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Analysis Metadata', margin, currentY);
  currentY += 15;

  const metadata = [
    ['Analysis Date', new Date(data.timestamp).toLocaleString()],
    ['Source File', data.fileName],
    ['Analysis Method', 'AI-powered image analysis with TensorFlow.js'],
    ['Confidence Score', `${Math.round(data.analysis.confidence * 100)}%`],
    ['Bug Type', data.analysis.bugType],
    ['Severity Level', data.analysis.severity.toUpperCase()]
  ];

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  metadata.forEach(([key, value]) => {
    if (currentY > 270) {
      pdf.addPage();
      currentY = 30;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${key}:`, margin, currentY);
    pdf.setFont('helvetica', 'normal');
    const valueLines = pdf.splitTextToSize(value, maxWidth - 80);
    
    let valueY = currentY;
    valueLines.forEach((line: string) => {
      pdf.text(line, margin + 80, valueY);
      valueY += 5;
    });
    
    currentY = Math.max(currentY + 8, valueY + 3);
  });

  currentY += 15;

  // Methodology
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Analysis Methodology', margin, currentY);
  currentY += 15;

  const methodology = [
    'Image preprocessing and feature extraction using computer vision techniques',
    'Object detection and classification using pre-trained machine learning models',
    'Text recognition and semantic analysis for error message detection',
    'Pattern matching against known bug signatures and error types',
    'Confidence scoring based on multiple detection algorithms',
    'Root cause analysis using expert system rules and heuristics',
    'Solution recommendation based on bug type classification and severity assessment'
  ];

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  methodology.forEach((item) => {
    if (currentY > 270) {
      pdf.addPage();
      currentY = 30;
    }
    
    const itemText = `• ${item}`;
    const itemLines = pdf.splitTextToSize(itemText, maxWidth - 10);
    
    itemLines.forEach((line: string) => {
      pdf.text(line, margin + 5, currentY);
      currentY += 5;
    });
    currentY += 2;
  });
};

const addFooterToAllPages = (pdf: jsPDF, data: BugAnalysisData) => {
  const pageCount = pdf.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    // Footer background
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 280, pdf.internal.pageSize.getWidth(), 20, 'F');
    
    // Footer line
    pdf.setDrawColor(220, 38, 38);
    pdf.setLineWidth(0.5);
    pdf.line(20, 280, pdf.internal.pageSize.getWidth() - 20, 280);
    
    // Footer text
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Bug Analysis Report - ${data.analysis.bugType}`, 20, 287);
    pdf.text(`Page ${i} of ${pageCount}`, pdf.internal.pageSize.getWidth() - 20, 287, { align: 'right' });
    pdf.text(`Generated by TechHub AI • ${new Date(data.timestamp).toLocaleDateString()}`, pdf.internal.pageSize.getWidth() / 2, 287, { align: 'center' });
  }
};

// Helper function to get impact assessment based on bug type and severity
const getImpactAssessment = (bugType: string, severity: string): string[] => {
  const baseImpacts = {
    'UI Error': [
      'User experience degradation and interface usability issues',
      'Potential accessibility compliance violations',
      'Brand reputation impact due to poor visual presentation'
    ],
    'Network Error': [
      'Service unavailability and data synchronization failures',
      'User frustration due to failed operations and timeouts',
      'Potential data loss or inconsistency issues'
    ],
    'Runtime Exception': [
      'Application crashes and unexpected termination',
      'Data corruption or loss of user work',
      'System instability and reduced reliability'
    ],
    'Syntax Error': [
      'Application compilation or deployment failures',
      'Development workflow interruption and delays',
      'Potential security vulnerabilities if not addressed'
    ],
    'Logic Error': [
      'Incorrect application behavior and wrong results',
      'Business process failures and data integrity issues',
      'User confusion and loss of trust in the system'
    ]
  };

  const severityMultipliers = {
    critical: ['Immediate business impact and potential revenue loss', 'High risk of system-wide failures'],
    high: ['Significant user impact and workflow disruption', 'Moderate business risk'],
    medium: ['Noticeable user inconvenience', 'Limited business impact'],
    low: ['Minor user experience issues', 'Minimal business risk']
  };

  const impacts = baseImpacts[bugType as keyof typeof baseImpacts] || ['General system impact'];
  const severityImpacts = severityMultipliers[severity as keyof typeof severityMultipliers] || [];

  return [...impacts, ...severityImpacts];
};