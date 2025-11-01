import jsPDF from 'jspdf';
import { PDFTheme, modernTheme } from './PDFTheme';
import { PDFLayoutEngine } from './PDFLayoutEngine';
import { PDFContentRenderer } from './PDFContentRenderer';
import { AnalysisParser, AnalysisSection } from './AnalysisParser';

// Interface Segregation: Define clean interfaces
export interface PDFExportOptions {
  repositoryName: string;
  analysis: string;
  theme?: PDFTheme;
}

// Open/Closed: Open for extension via theme configuration
export class PDFGenerator {
  private doc: jsPDF;
  private theme: PDFTheme;
  private layout: PDFLayoutEngine;
  private renderer: PDFContentRenderer;

  constructor(theme: PDFTheme = modernTheme) {
    // A4 is 210mm x 297mm, increasing to 260mm x 297mm for full laptop width coverage
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [260, 297],
    });
    this.theme = theme;
    this.layout = new PDFLayoutEngine(this.doc, theme);
    this.renderer = new PDFContentRenderer(this.doc, theme, this.layout);
  }

  public generate(options: PDFExportOptions): void {
    const { repositoryName, analysis } = options;
    
    // Pre-parse sections for better performance
    const sections = AnalysisParser.parseAnalysis(analysis);
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    // Render header
    this.renderer.renderHeader(repositoryName);
    
    // Render repository info
    this.renderer.renderRepositoryInfo(repositoryName, date);
    
    // Batch render sections
    const totalSections = sections.length;
    sections.forEach((section, index) => {
      this.renderSection(section);
      
      // Add divider between sections
      if (index < totalSections - 1) {
        this.renderer.renderDivider();
      }
    });
    
    // Add page numbers
    this.layout.addPageNumbers();
  }

  private renderSection(section: AnalysisSection): void {
    const colorMap = {
      priority: this.theme.colors.danger,
      recommendation: this.theme.colors.success,
      overview: this.theme.colors.primary,
      technical: this.theme.colors.accent,
      general: this.theme.colors.secondary,
    };
    
    const color = colorMap[section.type];
    
    // Render section header
    this.renderer.renderSectionHeader(section.title, color);
    
    // Parse and render content
    const items = AnalysisParser.parseContentItems(section.content);
    
    items.forEach((item) => {
      if (item.isHighlight && section.type === 'priority') {
        this.renderer.renderHighlightBox(item.text, 'warning');
      } else if (item.isHighlight && section.type === 'recommendation') {
        this.renderer.renderHighlightBox(item.text, 'success');
      } else if (item.isBullet) {
        this.renderer.renderBulletPoint(item.text);
      } else {
        this.renderer.renderParagraph(item.text);
      }
    });
  }

  public save(filename: string): void {
    this.doc.save(filename);
  }
}
