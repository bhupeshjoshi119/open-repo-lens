// Single Responsibility: Parse and structure analysis content
export interface AnalysisSection {
  title: string;
  content: string;
  type: 'overview' | 'priority' | 'recommendation' | 'technical' | 'general';
}

export class AnalysisParser {
  public static parseAnalysis(analysis: string): AnalysisSection[] {
    const sections = analysis.split(/##\s+/).filter(Boolean);
    
    return sections.map((section) => {
      const [title, ...contentLines] = section.split('\n');
      const content = contentLines.join('\n').trim();
      
      return {
        title: title.trim(),
        content,
        type: this.determineSectionType(title),
      };
    }).filter(section => section.content);
  }

  private static determineSectionType(title: string): AnalysisSection['type'] {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('priority') || lowerTitle.includes('critical') || lowerTitle.includes('urgent')) {
      return 'priority';
    }
    if (lowerTitle.includes('recommendation') || lowerTitle.includes('actionable') || lowerTitle.includes('suggestion')) {
      return 'recommendation';
    }
    if (lowerTitle.includes('overview') || lowerTitle.includes('summary') || lowerTitle.includes('health')) {
      return 'overview';
    }
    if (lowerTitle.includes('technical') || lowerTitle.includes('architecture') || lowerTitle.includes('code')) {
      return 'technical';
    }
    
    return 'general';
  }

  public static parseContentItems(content: string): Array<{ text: string; isBullet: boolean; isHighlight: boolean }> {
    const lines = content.split('\n');
    const items: Array<{ text: string; isBullet: boolean; isHighlight: boolean }> = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const isBullet = /^[-*•]\s/.test(trimmed);
      const isHighlight = /^\*\*.*\*\*/.test(trimmed);
      const cleanText = trimmed
        .replace(/^[-*•]\s/, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '');
      
      items.push({
        text: cleanText,
        isBullet,
        isHighlight,
      });
    }
    
    return items;
  }
}
