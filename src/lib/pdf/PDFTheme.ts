// Single Responsibility: Theme configuration only
export interface PDFTheme {
  colors: {
    primary: [number, number, number];
    secondary: [number, number, number];
    accent: [number, number, number];
    success: [number, number, number];
    warning: [number, number, number];
    danger: [number, number, number];
    text: [number, number, number];
    textLight: [number, number, number];
    background: [number, number, number];
    backgroundLight: [number, number, number];
  };
  fonts: {
    title: number;
    heading: number;
    subheading: number;
    body: number;
    small: number;
  };
  spacing: {
    section: number;
    paragraph: number;
    line: number;
  };
  margins: {
    page: number;
    content: number;
  };
}

export const modernTheme: PDFTheme = {
  colors: {
    primary: [79, 70, 229],        // Indigo
    secondary: [16, 185, 129],     // Green
    accent: [236, 72, 153],        // Pink
    success: [34, 197, 94],        // Green
    warning: [251, 191, 36],       // Amber
    danger: [239, 68, 68],         // Red
    text: [17, 24, 39],            // Gray-900
    textLight: [107, 114, 128],    // Gray-500
    background: [255, 255, 255],   // White
    backgroundLight: [249, 250, 251], // Gray-50
  },
  fonts: {
    title: 28,
    heading: 18,
    subheading: 14,
    body: 11,
    small: 9,
  },
  spacing: {
    section: 16,
    paragraph: 8,
    line: 5,
  },
  margins: {
    page: 25,
    content: 15,
  },
};
