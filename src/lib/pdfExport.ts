// Dependency Inversion: Depend on abstractions (PDFGenerator) not concretions
import { PDFGenerator } from './pdf/PDFGenerator';

export interface PDFExportOptions {
  repositoryName: string;
  analysis: string;
}

export const exportAnalysisToPDF = ({ repositoryName, analysis }: PDFExportOptions) => {
  // Use the modern PDF generator with SOLID principles
  const generator = new PDFGenerator();
  
  generator.generate({
    repositoryName,
    analysis,
  });
  
  // Save with sanitized filename
  const fileName = `${repositoryName.replace(/[^a-z0-9]/gi, '_')}_analysis.pdf`;
  generator.save(fileName);
};
