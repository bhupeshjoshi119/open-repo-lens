import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Download, Sparkles, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PDFReportGeneratorProps {
  repository: any;
  analysis: string;
  prediction?: any;
  className?: string;
}

export const PDFReportGenerator = ({ 
  repository, 
  analysis, 
  prediction,
  className 
}: PDFReportGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const generatePDFReport = async () => {
    if (!repository || !analysis) {
      toast({
        title: "Missing Data",
        description: "Repository and analysis data are required to generate PDF",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      
      setProgress(10);

      // Add title page
      await addTitlePage(pdf, repository, pageWidth, pageHeight, margin);
      setProgress(25);

      // Add executive summary
      pdf.addPage();
      await addExecutiveSummary(pdf, repository, analysis, pageWidth, margin);
      setProgress(40);

      // Add detailed analysis
      pdf.addPage();
      await addDetailedAnalysis(pdf, analysis, pageWidth, margin);
      setProgress(60);

      // Add infographics if prediction data is available
      if (prediction) {
        pdf.addPage();
        await addInfographics(pdf, prediction, pageWidth, pageHeight, margin);
        setProgress(80);
      }

      // Add recommendations
      pdf.addPage();
      await addRecommendations(pdf, analysis, pageWidth, margin);
      setProgress(95);

      // Add footer to all pages
      addFooterToAllPages(pdf, repository);
      setProgress(100);

      // Save the PDF
      const fileName = `${repository.name}_analysis_report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Generated Successfully",
        description: `Report saved as ${fileName}`,
      });

    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "PDF Generation Failed",
        description: "An error occurred while generating the PDF report",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Generate PDF Report</h3>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="w-3 h-3" />
          Enhanced
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Generate a comprehensive PDF report with stunning infographics and detailed analysis
      </p>

      {generating && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Generating report...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <Button 
        onClick={generatePDFReport}
        disabled={generating || !repository || !analysis}
        className="w-full h-10 min-h-[2.5rem] max-h-[2.5rem]"
        size="default"
        style={{ height: '2.5rem' }}
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Generate PDF Report
          </>
        )}
      </Button>
    </Card>
  );
};

// Helper functions for PDF generation
const addTitlePage = async (
  pdf: jsPDF, 
  repository: any, 
  pageWidth: number, 
  pageHeight: number, 
  margin: number
) => {
  // Add gradient background
  pdf.setFillColor(59, 130, 246); // Blue gradient start
  pdf.rect(0, 0, pageWidth, pageHeight / 3, 'F');
  
  pdf.setFillColor(147, 51, 234); // Purple gradient end
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

  // Repository stats box
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

  // Description
  if (repository.description) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'italic');
    const description = repository.description.length > 100 
      ? repository.description.substring(0, 100) + '...' 
      : repository.description;
    pdf.text(description, pageWidth / 2, 200, { align: 'center', maxWidth: pageWidth - 2 * margin });
  }
};

const addExecutiveSummary = async (
  pdf: jsPDF, 
  repository: any, 
  analysis: string, 
  pageWidth: number, 
  margin: number
) => {
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', margin, 30);

  // Extract health score if available
  const healthScoreMatch = analysis.match(/health score[:\s]+(\d+)/i);
  if (healthScoreMatch) {
    const score = parseInt(healthScoreMatch[1]);
    
    // Health score visualization
    pdf.setFillColor(240, 240, 240);
    pdf.roundedRect(margin, 45, pageWidth - 2 * margin, 30, 3, 3, 'F');
    
    pdf.setFontSize(14);
    pdf.text('Repository Health Score', margin + 10, 60);
    
    // Score bar
    const barWidth = (pageWidth - 2 * margin - 20) * (score / 100);
    const color = score >= 80 ? [34, 197, 94] : score >= 60 ? [59, 130, 246] : [239, 68, 68];
    pdf.setFillColor(...color);
    pdf.rect(margin + 10, 65, barWidth, 5, 'F');
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${score}/100`, pageWidth - margin - 30, 70);
  }

  // Key findings
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Key Findings', margin, 95);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  // Extract key points from analysis
  const keyPoints = extractKeyPoints(analysis);
  keyPoints.forEach((point, index) => {
    pdf.text(`• ${point}`, margin + 5, 110 + (index * 8), { maxWidth: pageWidth - 2 * margin - 10 });
  });
};

const addDetailedAnalysis = async (
  pdf: jsPDF, 
  analysis: string, 
  pageWidth: number, 
  margin: number
) => {
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Detailed Analysis', margin, 30);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  // Split analysis into sections
  const sections = analysis.split(/##\s+/).filter(Boolean);
  let yPosition = 50;

  sections.forEach((section, index) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 30;
    }

    const [title, ...content] = section.split('\n');
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title.trim(), margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const contentText = content.join('\n').trim();
    const lines = pdf.splitTextToSize(contentText, pageWidth - 2 * margin);
    
    lines.forEach((line: string) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 30;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    });
    
    yPosition += 10;
  });
};

const addInfographics = async (
  pdf: jsPDF, 
  prediction: any, 
  pageWidth: number, 
  pageHeight: number, 
  margin: number
) => {
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Predictive Analytics', margin, 30);

  // Create a simple chart visualization
  if (prediction.chartData && prediction.chartData.length > 0) {
    const chartHeight = 80;
    const chartWidth = pageWidth - 2 * margin;
    const chartY = 50;
    
    // Chart background
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, chartY, chartWidth, chartHeight, 'F');
    
    // Chart border
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin, chartY, chartWidth, chartHeight, 'S');
    
    // Data points
    const maxValue = Math.max(...prediction.chartData.map((d: any) => Math.max(d.value, d.predicted || 0)));
    const minValue = Math.min(...prediction.chartData.map((d: any) => Math.min(d.value, d.predicted || 0)));
    const range = maxValue - minValue || 1;
    
    prediction.chartData.forEach((point: any, index: number) => {
      const x = margin + (index / (prediction.chartData.length - 1)) * chartWidth;
      const y = chartY + chartHeight - ((point.value - minValue) / range) * chartHeight;
      
      // Historical data points
      pdf.setFillColor(59, 130, 246);
      pdf.circle(x, y, 2, 'F');
      
      // Predicted data points
      if (point.predicted !== undefined) {
        const predY = chartY + chartHeight - ((point.predicted - minValue) / range) * chartHeight;
        pdf.setFillColor(147, 51, 234);
        pdf.circle(x, predY, 2, 'F');
      }
    });
    
    // Legend
    pdf.setFontSize(10);
    pdf.setFillColor(59, 130, 246);
    pdf.circle(margin + 10, chartY + chartHeight + 15, 2, 'F');
    pdf.text('Historical', margin + 20, chartY + chartHeight + 18);
    
    pdf.setFillColor(147, 51, 234);
    pdf.circle(margin + 80, chartY + chartHeight + 15, 2, 'F');
    pdf.text('Predicted', margin + 90, chartY + chartHeight + 18);
  }

  // Key metrics
  if (prediction.keyMetrics) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Predictions', margin, 160);

    prediction.keyMetrics.forEach((metric: any, index: number) => {
      const y = 180 + (index * 20);
      
      // Metric box
      pdf.setFillColor(245, 245, 245);
      pdf.roundedRect(margin, y - 5, pageWidth - 2 * margin, 15, 2, 2, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(metric.label, margin + 5, y + 5);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(metric.value, pageWidth - margin - 30, y + 5, { align: 'right' });
    });
  }
};

const addRecommendations = async (
  pdf: jsPDF, 
  analysis: string, 
  pageWidth: number, 
  margin: number
) => {
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Recommendations', margin, 30);

  // Extract recommendations from analysis
  const recommendations = extractRecommendations(analysis);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  recommendations.forEach((rec, index) => {
    const y = 50 + (index * 15);
    
    // Recommendation box
    pdf.setFillColor(239, 246, 255);
    pdf.setDrawColor(59, 130, 246);
    pdf.roundedRect(margin, y - 3, pageWidth - 2 * margin, 12, 2, 2, 'FD');
    
    pdf.text(`${index + 1}. ${rec}`, margin + 5, y + 5, { maxWidth: pageWidth - 2 * margin - 10 });
  });
};

const addFooterToAllPages = (pdf: jsPDF, repository: any) => {
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
  
  // Look for bullet points or numbered lists
  const bulletMatches = analysis.match(/[•\-\*]\s+([^\n]+)/g);
  if (bulletMatches) {
    points.push(...bulletMatches.map(match => match.replace(/[•\-\*]\s+/, '').trim()).slice(0, 5));
  }
  
  // Look for sentences with key indicators
  const keyIndicators = ['critical', 'important', 'significant', 'major', 'key', 'primary'];
  const sentences = analysis.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    if (keyIndicators.some(indicator => sentence.toLowerCase().includes(indicator))) {
      points.push(sentence.trim());
    }
  });
  
  return points.slice(0, 6); // Limit to 6 key points
};

const extractRecommendations = (analysis: string): string[] => {
  const recommendations: string[] = [
    "Implement automated testing and continuous integration",
    "Improve documentation and code comments",
    "Establish clear contribution guidelines",
    "Set up issue templates and labels for better organization",
    "Consider implementing security scanning tools",
    "Regular dependency updates and vulnerability checks"
  ];
  
  // Try to extract actual recommendations from analysis
  const recSection = analysis.match(/recommendations?[:\s]+([\s\S]*?)(?=##|$)/i);
  if (recSection) {
    const extractedRecs = recSection[1].match(/[•\-\*]\s+([^\n]+)/g);
    if (extractedRecs) {
      return extractedRecs.map(rec => rec.replace(/[•\-\*]\s+/, '').trim()).slice(0, 8);
    }
  }
  
  return recommendations;
};