import jsPDF from 'jspdf';
import { PDFTheme } from './PDFTheme';

// Single Responsibility: Handle page layout and positioning
export class PDFLayoutEngine {
  private doc: jsPDF;
  private theme: PDFTheme;
  private currentY: number;
  private pageWidth: number;
  private pageHeight: number;

  constructor(doc: jsPDF, theme: PDFTheme) {
    this.doc = doc;
    this.theme = theme;
    this.currentY = theme.margins.page;
    this.pageWidth = doc.internal.pageSize.getWidth();
    this.pageHeight = doc.internal.pageSize.getHeight();
  }

  public getCurrentY(): number {
    return this.currentY;
  }

  public setCurrentY(y: number): void {
    this.currentY = y;
  }

  public getContentWidth(): number {
    return this.pageWidth - (this.theme.margins.page * 2);
  }

  public getPageWidth(): number {
    return this.pageWidth;
  }

  public getPageHeight(): number {
    return this.pageHeight;
  }

  public checkPageBreak(requiredSpace: number): boolean {
    if (this.currentY + requiredSpace > this.pageHeight - this.theme.margins.page) {
      this.doc.addPage();
      this.currentY = this.theme.margins.page;
      return true;
    }
    return false;
  }

  public addVerticalSpace(space: number): void {
    this.currentY += space;
  }

  public drawRoundedBox(
    x: number,
    y: number,
    width: number,
    height: number,
    color: [number, number, number],
    opacity: number = 0.1,
    radius: number = 4
  ): void {
    this.doc.setFillColor(...color);
    this.doc.setGState(this.doc.GState({ opacity }));
    this.doc.roundedRect(x, y, width, height, radius, radius, 'F');
    this.doc.setGState(this.doc.GState({ opacity: 1 }));
  }

  public drawAccentBar(
    x: number,
    y: number,
    width: number,
    height: number,
    color: [number, number, number]
  ): void {
    this.doc.setFillColor(...color);
    this.doc.rect(x, y, width, height, 'F');
  }

  public drawCircle(
    x: number,
    y: number,
    radius: number,
    fillColor: [number, number, number],
    strokeColor?: [number, number, number]
  ): void {
    this.doc.setFillColor(...fillColor);
    if (strokeColor) {
      this.doc.setDrawColor(...strokeColor);
      this.doc.circle(x, y, radius, 'FD');
    } else {
      this.doc.circle(x, y, radius, 'F');
    }
  }

  public addPageNumbers(): void {
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(this.theme.fonts.small);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...this.theme.colors.textLight);
      
      const pageText = `${i} / ${totalPages}`;
      const textWidth = this.doc.getTextWidth(pageText);
      this.doc.text(
        pageText,
        this.pageWidth - this.theme.margins.page - textWidth,
        this.pageHeight - this.theme.margins.page / 2
      );
    }
  }
}
