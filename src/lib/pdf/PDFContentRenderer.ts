import jsPDF from 'jspdf';
import { PDFTheme } from './PDFTheme';
import { PDFLayoutEngine } from './PDFLayoutEngine';

// Single Responsibility: Render different types of content
export class PDFContentRenderer {
  private doc: jsPDF;
  private theme: PDFTheme;
  private layout: PDFLayoutEngine;

  constructor(doc: jsPDF, theme: PDFTheme, layout: PDFLayoutEngine) {
    this.doc = doc;
    this.theme = theme;
    this.layout = layout;
    
    // Set character spacing to 0 to prevent extra letter spacing
    this.doc.setCharSpace(0);
  }

  // Cache for normalized text to avoid repeated processing
  private textCache = new Map<string, string>();

  // Utility to normalize text spacing with caching
  private normalizeText(text: string): string {
    if (this.textCache.has(text)) {
      return this.textCache.get(text)!;
    }
    
    // Remove extra spaces between characters while preserving word spacing
    const normalized = text
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .trim();                // Remove leading/trailing spaces
    
    this.textCache.set(text, normalized);
    return normalized;
  }

  public renderHeader(repositoryName: string): void {
    const pageWidth = this.layout.getPageWidth();
    
    // Modern gradient-style header with geometric shapes
    this.doc.setFillColor(...this.theme.colors.primary);
    this.doc.rect(0, 0, pageWidth, 55, 'F');
    
    // Add accent circles
    this.doc.setFillColor(...this.theme.colors.accent);
    this.doc.setGState(this.doc.GState({ opacity: 0.2 }));
    this.doc.circle(pageWidth - 30, 15, 25, 'F');
    this.doc.circle(40, 45, 20, 'F');
    this.doc.setGState(this.doc.GState({ opacity: 1 }));
    
    // Title with icon placeholder
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(this.theme.fonts.title);
    this.doc.setFont('helvetica', 'bold');
    
    const title = this.normalizeText('Repository Analysis');
    this.doc.text(title, this.theme.margins.page + 5, 25);
    
    // Subtitle
    this.doc.setFontSize(this.theme.fonts.body);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setGState(this.doc.GState({ opacity: 0.9 }));
    this.doc.text(this.normalizeText('AI-Powered Comprehensive Report'), this.theme.margins.page + 5, 35);
    this.doc.setGState(this.doc.GState({ opacity: 1 }));
    
    this.layout.setCurrentY(65);
  }

  public renderRepositoryInfo(repositoryName: string, date: string): void {
    const margin = this.theme.margins.page;
    const y = this.layout.getCurrentY();
    
    // Repository name card
    this.layout.drawRoundedBox(
      margin,
      y,
      this.layout.getContentWidth(),
      30,
      this.theme.colors.primary,
      0.08,
      6
    );
    
    // Accent bar
    this.layout.drawAccentBar(
      margin,
      y,
      4,
      30,
      this.theme.colors.accent
    );
    
    this.doc.setFontSize(this.theme.fonts.heading);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.theme.colors.text);
    this.doc.text(this.normalizeText(repositoryName), margin + 12, y + 12);
    
    this.doc.setFontSize(this.theme.fonts.small);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.theme.colors.textLight);
    this.doc.text(this.normalizeText(`Generated: ${date}`), margin + 12, y + 22);
    
    this.layout.setCurrentY(y + 40);
  }

  public renderSectionHeader(
    title: string,
    color: [number, number, number],
    icon: string = '◆'
  ): void {
    this.layout.checkPageBreak(35);
    
    const margin = this.theme.margins.page;
    const y = this.layout.getCurrentY();
    
    // Section background
    this.layout.drawRoundedBox(
      margin,
      y - 2,
      this.layout.getContentWidth(),
      24,
      color,
      0.12,
      6
    );
    
    // Icon circle
    this.layout.drawCircle(
      margin + 10,
      y + 8,
      6,
      color
    );
    
    // Section title
    this.doc.setFontSize(this.theme.fonts.heading);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...color);
    
    const titleText = this.doc.splitTextToSize(this.normalizeText(title), this.layout.getContentWidth() - 35);
    this.doc.text(titleText, margin + 22, y + 10);
    
    this.layout.setCurrentY(y + 30);
  }

  public renderParagraph(text: string, indent: number = 0): void {
    const margin = this.theme.margins.page + indent;
    const maxWidth = this.layout.getContentWidth() - indent;
    
    this.doc.setFontSize(this.theme.fonts.body);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.theme.colors.text);
    
    const normalizedText = this.normalizeText(text);
    const lines = this.doc.splitTextToSize(normalizedText, maxWidth);
    
    // Batch render lines for better performance
    lines.forEach((line: string) => {
      this.layout.checkPageBreak(8);
      this.doc.text(line, margin, this.layout.getCurrentY());
      this.layout.addVerticalSpace(this.theme.spacing.line);
    });
    
    this.layout.addVerticalSpace(this.theme.spacing.paragraph);
  }

  public renderBulletPoint(text: string): void {
    const margin = this.theme.margins.page;
    const indent = 18;
    const y = this.layout.getCurrentY();
    
    this.layout.checkPageBreak(10);
    
    // Modern bullet
    this.layout.drawCircle(
      margin + 6,
      y - 1.5,
      1.5,
      this.theme.colors.secondary
    );
    
    this.doc.setFontSize(this.theme.fonts.body);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.theme.colors.text);
    
    const normalizedText = this.normalizeText(text);
    const lines = this.doc.splitTextToSize(normalizedText, this.layout.getContentWidth() - indent);
    
    // Batch render for performance
    lines.forEach((line: string, index: number) => {
      if (index > 0) this.layout.checkPageBreak(6);
      this.doc.text(line, margin + indent, this.layout.getCurrentY());
      this.layout.addVerticalSpace(this.theme.spacing.line);
    });
    
    this.layout.addVerticalSpace(2);
  }

  public renderHighlightBox(text: string, type: 'success' | 'warning' | 'danger' | 'info'): void {
    const colorMap = {
      success: this.theme.colors.success,
      warning: this.theme.colors.warning,
      danger: this.theme.colors.danger,
      info: this.theme.colors.primary,
    };
    
    const color = colorMap[type];
    const margin = this.theme.margins.page;
    const y = this.layout.getCurrentY();
    
    const normalizedText = this.normalizeText(text);
    const lines = this.doc.splitTextToSize(normalizedText, this.layout.getContentWidth() - 20);
    const height = (lines.length * this.theme.spacing.line) + 12;
    
    this.layout.checkPageBreak(height + 5);
    
    // Highlight box with border
    this.layout.drawRoundedBox(
      margin,
      y - 2,
      this.layout.getContentWidth(),
      height,
      color,
      0.1,
      4
    );
    
    // Border accent
    this.layout.drawAccentBar(margin, y - 2, 3, height, color);
    
    this.doc.setFontSize(this.theme.fonts.body);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.theme.colors.text);
    
    // Batch render for performance
    lines.forEach((line: string) => {
      this.doc.text(line, margin + 12, this.layout.getCurrentY() + 6);
      this.layout.addVerticalSpace(this.theme.spacing.line);
    });
    
    this.layout.addVerticalSpace(this.theme.spacing.paragraph + 5);
  }

  public renderDivider(): void {
    const margin = this.theme.margins.page;
    const y = this.layout.getCurrentY();
    
    this.doc.setDrawColor(...this.theme.colors.textLight);
    this.doc.setLineWidth(0.3);
    this.doc.setGState(this.doc.GState({ opacity: 0.3 }));
    this.doc.line(margin + 20, y, this.layout.getPageWidth() - margin - 20, y);
    this.doc.setGState(this.doc.GState({ opacity: 1 }));
    
    this.layout.addVerticalSpace(this.theme.spacing.section);
  }
}
