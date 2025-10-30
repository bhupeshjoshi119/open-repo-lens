// OCR and text analysis utilities for bug detection and Stack Overflow integration

interface StackOverflowResult {
  title: string;
  link: string;
  excerpt: string;
  score: number;
  tags: string[];
  hasAcceptedAnswer: boolean;
  answerCount: number;
  viewCount: number;
}

// Simple OCR simulation using canvas text detection
export const extractTextFromImage = async (imageDataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve('');
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Simulate OCR by analyzing image characteristics and generating mock text
      const mockText = simulateOCRFromImage(canvas, ctx);
      resolve(mockText);
    };
    
    img.onerror = () => resolve('');
    img.src = imageDataUrl;
  });
};

// Simulate OCR text extraction based on image analysis
const simulateOCRFromImage = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let redPixels = 0;
  let darkPixels = 0;
  let brightPixels = 0;
  
  // Analyze pixel distribution
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    
    if (r > 200 && g < 100 && b < 100) redPixels++;
    if (brightness < 50) darkPixels++;
    if (brightness > 200) brightPixels++;
  }
  
  const totalPixels = data.length / 4;
  const redRatio = redPixels / totalPixels;
  const darkRatio = darkPixels / totalPixels;
  const brightRatio = brightPixels / totalPixels;
  
  // Generate mock error text based on image characteristics
  const errorTexts = [
    // JavaScript/TypeScript errors
    "TypeError: Cannot read property 'map' of undefined\n    at Component.render (App.js:45:12)\n    at ReactDOM.render (react-dom.js:1234:5)",
    "ReferenceError: variable is not defined\n    at handleClick (Button.js:23:8)\n    at onClick (App.js:67:4)",
    "SyntaxError: Unexpected token '}' in JSON at position 156\n    at JSON.parse (<anonymous>)\n    at parseResponse (api.js:34:21)",
    
    // Python errors
    "AttributeError: 'NoneType' object has no attribute 'get'\n  File \"main.py\", line 42, in process_data\n    result = data.get('key')",
    "ImportError: No module named 'requests'\n  File \"app.py\", line 3, in <module>\n    import requests",
    "IndentationError: expected an indented block\n  File \"script.py\", line 15\n    print('Hello')",
    
    // Network/API errors
    "Error: Network request failed\nFetch API cannot load https://api.example.com/data\nCORS policy: No 'Access-Control-Allow-Origin' header",
    "Error 404: Not Found\nThe requested resource could not be found on this server\nPlease check the URL and try again",
    "Error 500: Internal Server Error\nSomething went wrong on our end\nPlease try again later",
    
    // Database errors
    "Error: Connection refused\nCould not connect to database server\nCheck your connection settings",
    "SQL Error: Table 'users' doesn't exist\nQuery: SELECT * FROM users WHERE id = 1",
    
    // Build/Deployment errors
    "Build failed: Module not found\nCannot resolve './components/Header'\nCheck import path and file existence",
    "Docker Error: Container failed to start\nPort 3000 is already in use\nPlease stop other services or use different port"
  ];
  
  // Select error text based on image characteristics
  let selectedText = "";
  
  if (redRatio > 0.05 && darkRatio > 0.3) {
    // Likely an error screenshot with red indicators on dark background
    selectedText = errorTexts[Math.floor(Math.random() * 5)]; // JS/TS errors
  } else if (darkRatio > 0.5) {
    // Likely a terminal or console
    selectedText = errorTexts[5 + Math.floor(Math.random() * 3)]; // Python errors
  } else if (brightRatio > 0.7) {
    // Likely a web page or light interface
    selectedText = errorTexts[8 + Math.floor(Math.random() * 3)]; // Network errors
  } else {
    // General error
    selectedText = errorTexts[Math.floor(Math.random() * errorTexts.length)];
  }
  
  return selectedText;
};

// Check if extracted text contains error indicators
export const containsErrorIndicators = (text: string): boolean => {
  const errorKeywords = [
    'error', 'exception', 'failed', 'crash', 'bug', 'warning', 'alert',
    'timeout', 'connection', 'network', 'server', '404', '500', 'null',
    'undefined', 'syntax', 'parse', 'compile', 'runtime', 'traceback',
    'stack trace', 'cannot read property', 'is not defined', 'module not found',
    'permission denied', 'access denied', 'cors', 'unauthorized'
  ];
  
  const lowerText = text.toLowerCase();
  return errorKeywords.some(keyword => lowerText.includes(keyword));
};

// Search Stack Overflow for solutions
export const searchStackOverflow = async (errorText: string): Promise<StackOverflowResult[]> => {
  // Simulate Stack Overflow API search
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Extract key terms from error text for search
  const searchTerms = extractSearchTerms(errorText);
  
  // Generate mock Stack Overflow results based on error type
  const mockResults = generateMockStackOverflowResults(searchTerms, errorText);
  
  return mockResults;
};

// Extract search terms from error text
const extractSearchTerms = (errorText: string): string[] => {
  const terms: string[] = [];
  
  // Extract error types
  const errorTypes = errorText.match(/(TypeError|ReferenceError|SyntaxError|AttributeError|ImportError|IndentationError|NetworkError)/gi);
  if (errorTypes) {
    terms.push(...errorTypes);
  }
  
  // Extract key phrases
  const keyPhrases = [
    'cannot read property', 'is not defined', 'module not found',
    'connection refused', 'cors policy', 'internal server error',
    'build failed', 'docker error', 'permission denied'
  ];
  
  keyPhrases.forEach(phrase => {
    if (errorText.toLowerCase().includes(phrase)) {
      terms.push(phrase);
    }
  });
  
  // Extract programming languages
  const languages = ['javascript', 'typescript', 'python', 'java', 'react', 'node', 'docker'];
  languages.forEach(lang => {
    if (errorText.toLowerCase().includes(lang)) {
      terms.push(lang);
    }
  });
  
  return terms;
};

// Generate mock Stack Overflow results
const generateMockStackOverflowResults = (searchTerms: string[], errorText: string): StackOverflowResult[] => {
  const results: StackOverflowResult[] = [];
  
  // Determine error category
  const isJavaScript = errorText.includes('TypeError') || errorText.includes('ReferenceError');
  const isPython = errorText.includes('AttributeError') || errorText.includes('ImportError');
  const isNetwork = errorText.includes('Network') || errorText.includes('CORS') || errorText.includes('404');
  const isDocker = errorText.includes('Docker') || errorText.includes('Container');
  
  if (isJavaScript) {
    results.push(
      {
        title: "TypeError: Cannot read property 'map' of undefined - React",
        link: "https://stackoverflow.com/questions/32064165/react-uncaught-typeerror-cannot-read-property-map-of-undefined",
        excerpt: "This error occurs when you try to call .map() on a variable that is undefined or null. Make sure your data is loaded before rendering...",
        score: 1247,
        tags: ['javascript', 'react', 'typescript', 'arrays'],
        hasAcceptedAnswer: true,
        answerCount: 15,
        viewCount: 89432
      },
      {
        title: "How to handle undefined variables in JavaScript",
        link: "https://stackoverflow.com/questions/27509/detecting-an-undefined-object-property",
        excerpt: "Use optional chaining (?.) or check if the variable exists before accessing its properties. You can also use default values...",
        score: 892,
        tags: ['javascript', 'undefined', 'error-handling'],
        hasAcceptedAnswer: true,
        answerCount: 23,
        viewCount: 156789
      }
    );
  }
  
  if (isPython) {
    results.push(
      {
        title: "AttributeError: 'NoneType' object has no attribute",
        link: "https://stackoverflow.com/questions/8949252/why-do-i-get-attributeerror-nonetype-object-has-no-attribute-something",
        excerpt: "This error means you're trying to access an attribute of a None object. Check if your variable is None before accessing attributes...",
        score: 1156,
        tags: ['python', 'attributeerror', 'nonetype'],
        hasAcceptedAnswer: true,
        answerCount: 18,
        viewCount: 234567
      },
      {
        title: "Python ImportError: No module named - Solutions",
        link: "https://stackoverflow.com/questions/338768/python-error-importerror-no-module-named",
        excerpt: "Install the missing module using pip install module_name or check if the module is in your Python path...",
        score: 743,
        tags: ['python', 'import', 'modules', 'pip'],
        hasAcceptedAnswer: true,
        answerCount: 12,
        viewCount: 98765
      }
    );
  }
  
  if (isNetwork) {
    results.push(
      {
        title: "CORS policy: No 'Access-Control-Allow-Origin' header",
        link: "https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe",
        excerpt: "This is a CORS (Cross-Origin Resource Sharing) error. You need to configure your server to allow cross-origin requests...",
        score: 2341,
        tags: ['cors', 'javascript', 'api', 'fetch'],
        hasAcceptedAnswer: true,
        answerCount: 28,
        viewCount: 445678
      },
      {
        title: "How to fix 404 Not Found errors in web applications",
        link: "https://stackoverflow.com/questions/2820256/how-to-fix-404-error",
        excerpt: "404 errors occur when the requested resource cannot be found. Check your URL paths, routing configuration, and server setup...",
        score: 567,
        tags: ['http', '404', 'routing', 'web'],
        hasAcceptedAnswer: true,
        answerCount: 9,
        viewCount: 123456
      }
    );
  }
  
  if (isDocker) {
    results.push(
      {
        title: "Docker container failed to start - port already in use",
        link: "https://stackoverflow.com/questions/39632667/how-do-i-kill-the-process-currently-using-a-port-on-localhost-in-windows",
        excerpt: "Find and kill the process using the port with 'lsof -ti:3000 | xargs kill -9' on Mac/Linux or use Task Manager on Windows...",
        score: 892,
        tags: ['docker', 'port', 'container', 'devops'],
        hasAcceptedAnswer: true,
        answerCount: 14,
        viewCount: 67890
      }
    );
  }
  
  // Add general programming solutions
  results.push(
    {
      title: "Best practices for error handling and debugging",
      link: "https://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags",
      excerpt: "Implement proper try-catch blocks, use logging for debugging, and follow defensive programming practices...",
      score: 445,
      tags: ['debugging', 'error-handling', 'best-practices'],
      hasAcceptedAnswer: true,
      answerCount: 7,
      viewCount: 34567
    }
  );
  
  return results.slice(0, 5); // Return top 5 results
};

// Generate GitHub issue template based on extracted text and Stack Overflow results
export const generateGitHubIssueTemplate = (
  errorText: string, 
  stackOverflowResults: StackOverflowResult[]
): string => {
  const errorType = detectErrorType(errorText);
  const severity = detectSeverity(errorText);
  
  const template = `## Bug Report

### 🐛 Issue Description
A ${severity.toLowerCase()} severity ${errorType.toLowerCase()} has been detected in the application.

### 📋 Error Details
\`\`\`
${errorText.substring(0, 500)}${errorText.length > 500 ? '...' : ''}
\`\`\`

### 🔍 Error Type
- **Category**: ${errorType}
- **Severity**: ${severity}
- **Environment**: ${detectEnvironment(errorText)}

### 💡 Potential Solutions
Based on Stack Overflow research and best practices:

${stackOverflowResults.slice(0, 3).map((result, idx) => 
  `${idx + 1}. **${result.title}**
   - Score: ${result.score} votes
   - Link: ${result.link}
   - Summary: ${result.excerpt.substring(0, 150)}...`
).join('\n\n')}

### 🔧 Recommended Actions
${generateRecommendedActions(errorType, errorText)}

### 📝 Steps to Reproduce
1. [Describe the steps that led to this error]
2. [Include any specific conditions or inputs]
3. [Mention the expected vs actual behavior]

### 🌍 Environment
- **OS**: [Your operating system]
- **Browser/Runtime**: [Browser version or Node.js version]
- **Framework**: [React, Vue, Angular, etc.]
- **Version**: [Application version]

### 📎 Additional Context
- Screenshot attached showing the error
- Related Stack Overflow discussions researched
- Potential impact: ${assessImpact(severity, errorType)}

### 🏷️ Labels
\`bug\` \`${severity.toLowerCase()}\` \`${errorType.toLowerCase().replace(' ', '-')}\` \`needs-investigation\`

---
*This issue was automatically generated by TechHub AI Image Analysis*`;

  return template;
};

// Detect error type from text
const detectErrorType = (errorText: string): string => {
  const lowerText = errorText.toLowerCase();
  
  if (lowerText.includes('typeerror') || lowerText.includes('referenceerror') || lowerText.includes('syntaxerror')) {
    return 'JavaScript Error';
  }
  if (lowerText.includes('attributeerror') || lowerText.includes('importerror') || lowerText.includes('indentationerror')) {
    return 'Python Error';
  }
  if (lowerText.includes('cors') || lowerText.includes('network') || lowerText.includes('fetch')) {
    return 'Network Error';
  }
  if (lowerText.includes('docker') || lowerText.includes('container')) {
    return 'Docker Error';
  }
  if (lowerText.includes('build') || lowerText.includes('compile')) {
    return 'Build Error';
  }
  if (lowerText.includes('database') || lowerText.includes('sql')) {
    return 'Database Error';
  }
  
  return 'Runtime Error';
};

// Detect severity from error text
const detectSeverity = (errorText: string): string => {
  const lowerText = errorText.toLowerCase();
  
  if (lowerText.includes('crash') || lowerText.includes('fatal') || lowerText.includes('critical')) {
    return 'Critical';
  }
  if (lowerText.includes('error') || lowerText.includes('exception') || lowerText.includes('failed')) {
    return 'High';
  }
  if (lowerText.includes('warning') || lowerText.includes('deprecated')) {
    return 'Medium';
  }
  
  return 'Low';
};

// Detect environment from error text
const detectEnvironment = (errorText: string): string => {
  const lowerText = errorText.toLowerCase();
  
  if (lowerText.includes('react') || lowerText.includes('jsx')) return 'React Application';
  if (lowerText.includes('vue')) return 'Vue.js Application';
  if (lowerText.includes('angular')) return 'Angular Application';
  if (lowerText.includes('node') || lowerText.includes('npm')) return 'Node.js Environment';
  if (lowerText.includes('python') || lowerText.includes('pip')) return 'Python Environment';
  if (lowerText.includes('docker')) return 'Docker Container';
  if (lowerText.includes('browser') || lowerText.includes('chrome')) return 'Web Browser';
  
  return 'Unknown Environment';
};

// Generate recommended actions based on error type
const generateRecommendedActions = (errorType: string, errorText: string): string => {
  const actions = {
    'JavaScript Error': `
1. **Check variable initialization**: Ensure variables are properly initialized before use
2. **Add null/undefined checks**: Use optional chaining (?.) or conditional checks
3. **Review data flow**: Verify that data is loaded before rendering components
4. **Add error boundaries**: Implement React error boundaries to catch and handle errors gracefully`,

    'Python Error': `
1. **Install missing modules**: Use pip install to install required packages
2. **Check import paths**: Verify module names and import statements
3. **Fix indentation**: Ensure consistent indentation (spaces or tabs, not mixed)
4. **Add null checks**: Check if objects are None before accessing attributes`,

    'Network Error': `
1. **Configure CORS**: Add proper CORS headers on your server
2. **Check API endpoints**: Verify URLs and endpoint availability
3. **Add error handling**: Implement proper error handling for network requests
4. **Use HTTPS**: Ensure secure connections where required`,

    'Docker Error': `
1. **Check port availability**: Use different ports or stop conflicting services
2. **Review Dockerfile**: Ensure proper configuration and dependencies
3. **Check resource limits**: Verify memory and CPU allocations
4. **Update base images**: Use latest stable base images`,

    'Build Error': `
1. **Check file paths**: Verify import paths and file locations
2. **Install dependencies**: Run npm install or yarn install
3. **Clear cache**: Clear build cache and node_modules
4. **Check syntax**: Review code for syntax errors`,

    'Database Error': `
1. **Verify connection**: Check database connection settings
2. **Check table existence**: Ensure required tables and schemas exist
3. **Review permissions**: Verify database user permissions
4. **Check queries**: Validate SQL syntax and table names`
  };
  
  return actions[errorType as keyof typeof actions] || `
1. **Review error message**: Carefully read the error message for clues
2. **Check recent changes**: Review recent code changes that might have caused the issue
3. **Search documentation**: Look up the error in official documentation
4. **Ask for help**: Post the issue on Stack Overflow or relevant forums`;
};

// Assess impact based on severity and error type
const assessImpact = (severity: string, errorType: string): string => {
  const impacts = {
    'Critical': 'Application crashes, data loss, or complete service unavailability',
    'High': 'Major functionality broken, significant user impact',
    'Medium': 'Some features affected, moderate user inconvenience',
    'Low': 'Minor issues, minimal user impact'
  };
  
  return impacts[severity as keyof typeof impacts] || 'Impact assessment needed';
};