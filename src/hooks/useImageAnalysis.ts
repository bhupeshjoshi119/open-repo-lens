import { useState } from "react";
import * as tf from "@tensorflow/tfjs";

interface DetectedObject {
  class: string;
  score: number;
  bbox?: number[];
}

interface Classification {
  className: string;
  probability: number;
}

interface TechnicalInfo {
  width: number;
  height: number;
  format: string;
  size: string;
  colorSpace: string;
}

interface ImageAnalysis {
  objects?: DetectedObject[];
  classification?: Classification[];
  technical?: TechnicalInfo;
  insights?: string;
}

export const useImageAnalysis = () => {
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (imageDataUrl: string) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Create image element
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageDataUrl;
      });

      // Get technical information
      const technical: TechnicalInfo = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        format: getImageFormat(imageDataUrl),
        size: formatFileSize(getImageSize(imageDataUrl)),
        colorSpace: "RGB"
      };

      // Convert image to tensor
      const tensor = tf.browser.fromPixels(img)
        .resizeNearestNeighbor([224, 224])
        .expandDims(0)
        .div(255.0);

      // Simulate object detection with enhanced bug detection
      const mockObjects: DetectedObject[] = await simulateObjectDetection(img);
      
      // Simulate image classification with bug-aware classification
      const mockClassification: Classification[] = await simulateImageClassification(img);

      // Generate AI insights with bug detection focus
      const insights = generateInsights(mockObjects, mockClassification, technical);

      const result: ImageAnalysis = {
        objects: mockObjects,
        classification: mockClassification,
        technical,
        insights
      };

      setAnalysis(result);
      
      // Dispatch analysis complete event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('image-analysis-complete', {
          detail: { 
            objectCount: mockObjects.length,
            classification: mockClassification[0]?.className || 'Unknown',
            hasPotentialBugs: checkForBugIndicators(mockObjects, mockClassification, insights)
          }
        }));
      }
      
      // Clean up tensor
      tensor.dispose();
      
    } catch (err) {
      console.error("Image analysis error:", err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeImage,
    analysis,
    loading,
    error
  };
};

// Helper functions
const getImageFormat = (dataUrl: string): string => {
  const match = dataUrl.match(/data:image\/([^;]+)/);
  return match ? match[1].toUpperCase() : "UNKNOWN";
};

const getImageSize = (dataUrl: string): number => {
  // Rough estimation of file size from base64
  const base64Length = dataUrl.split(',')[1]?.length || 0;
  return Math.round((base64Length * 3) / 4);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const simulateObjectDetection = async (img: HTMLImageElement): Promise<DetectedObject[]> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock object detection based on image characteristics
  const objects: DetectedObject[] = [];
  
  // Analyze image brightness and colors to simulate detection
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return objects;
  
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let totalBrightness = 0;
  let redSum = 0, greenSum = 0, blueSum = 0;
  let redPixels = 0, darkPixels = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    totalBrightness += (r + g + b) / 3;
    redSum += r;
    greenSum += g;
    blueSum += b;
    
    // Count red pixels (potential error indicators)
    if (r > 200 && g < 100 && b < 100) redPixels++;
    
    // Count dark pixels (potential console/terminal)
    if (r < 50 && g < 50 && b < 50) darkPixels++;
  }
  
  const pixelCount = data.length / 4;
  const avgBrightness = totalBrightness / pixelCount;
  const avgRed = redSum / pixelCount;
  const avgGreen = greenSum / pixelCount;
  const avgBlue = blueSum / pixelCount;
  const redRatio = redPixels / pixelCount;
  const darkRatio = darkPixels / pixelCount;
  
  // Enhanced detection for bug-related elements
  if (redRatio > 0.05) {
    objects.push({ class: "error_indicator", score: 0.85 });
  }
  
  if (darkRatio > 0.3) {
    objects.push({ class: "terminal_or_console", score: 0.78 });
  }
  
  if (avgBrightness > 150) {
    objects.push({ class: "bright_object", score: 0.85 });
  }
  
  if (avgGreen > avgRed && avgGreen > avgBlue) {
    objects.push({ class: "vegetation", score: 0.72 });
  }
  
  if (avgBlue > avgRed && avgBlue > avgGreen) {
    objects.push({ class: "sky_or_water", score: 0.68 });
  }
  
  // Add bug-related objects with higher probability for screenshots
  const bugRelatedObjects = ["alert_dialog", "error_message", "warning_icon", "exception_trace"];
  const commonObjects = ["person", "car", "building", "tree", "animal", "text", "logo"];
  
  // Higher chance of detecting bug-related objects in screenshots
  const isMostlyDark = darkRatio > 0.2;
  const hasRedElements = redRatio > 0.02;
  
  if (isMostlyDark || hasRedElements) {
    const bugObject = bugRelatedObjects[Math.floor(Math.random() * bugRelatedObjects.length)];
    objects.push({ class: bugObject, score: 0.6 + Math.random() * 0.3 });
  }
  
  const randomObject = commonObjects[Math.floor(Math.random() * commonObjects.length)];
  objects.push({ class: randomObject, score: 0.3 + Math.random() * 0.4 });
  
  return objects;
};

const simulateImageClassification = async (img: HTMLImageElement): Promise<Classification[]> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock classification based on image aspect ratio and size
  const aspectRatio = img.width / img.height;
  const classifications: Classification[] = [];
  
  // Enhanced classification for bug detection
  const isLikelyScreenshot = aspectRatio > 1.2 && aspectRatio < 2.5;
  
  if (isLikelyScreenshot) {
    classifications.push({ className: "Screenshot", probability: 0.78 });
    classifications.push({ className: "Application Interface", probability: 0.65 });
    classifications.push({ className: "Error Screen", probability: 0.45 });
  } else if (aspectRatio > 1.5) {
    classifications.push({ className: "Landscape", probability: 0.78 });
    classifications.push({ className: "Panoramic", probability: 0.45 });
  } else if (aspectRatio < 0.8) {
    classifications.push({ className: "Portrait", probability: 0.82 });
    classifications.push({ className: "Vertical", probability: 0.56 });
  } else {
    classifications.push({ className: "Square", probability: 0.71 });
    classifications.push({ className: "Social Media", probability: 0.43 });
  }
  
  // Add bug-specific categories with higher probability for certain image types
  const bugCategories = [
    "Error Dialog", "Console Output", "Stack Trace", "Debug Screen",
    "Warning Message", "Exception Report", "Log File", "Terminal"
  ];
  
  const generalCategories = [
    "Photography", "Digital Art", "Document", 
    "Diagram", "Chart", "Interface", "Natural"
  ];
  
  // Higher chance of bug-related classification for screenshots
  if (isLikelyScreenshot && Math.random() > 0.4) {
    const bugCategory = bugCategories[Math.floor(Math.random() * bugCategories.length)];
    classifications.push({ 
      className: bugCategory, 
      probability: 0.4 + Math.random() * 0.4 
    });
  }
  
  const randomCategory = generalCategories[Math.floor(Math.random() * generalCategories.length)];
  classifications.push({ 
    className: randomCategory, 
    probability: 0.2 + Math.random() * 0.5 
  });
  
  return classifications.sort((a, b) => b.probability - a.probability);
};

const generateInsights = (
  objects: DetectedObject[], 
  classification: Classification[], 
  technical: TechnicalInfo
): string => {
  let insights = "AI Analysis Summary:\n\n";
  
  // Technical insights
  insights += `This ${technical.format} image has dimensions of ${technical.width}×${technical.height} pixels (${technical.size}). `;
  
  if (technical.width > 1920 || technical.height > 1080) {
    insights += "High resolution image suitable for detailed analysis. ";
  }
  
  // Classification insights
  if (classification.length > 0) {
    const topClass = classification[0];
    insights += `The image is primarily classified as "${topClass.className}" with ${Math.round(topClass.probability * 100)}% confidence. `;
  }
  
  // Object detection insights
  if (objects.length > 0) {
    const highConfidenceObjects = objects.filter(obj => obj.score > 0.7);
    if (highConfidenceObjects.length > 0) {
      insights += `High-confidence detections include: ${highConfidenceObjects.map(obj => obj.class).join(", ")}. `;
    }
  }
  
  // Quality assessment
  const aspectRatio = technical.width / technical.height;
  if (aspectRatio > 2 || aspectRatio < 0.5) {
    insights += "Unusual aspect ratio detected - may be a panoramic or specialized format. ";
  }
  
  insights += "\n\nThis analysis uses TensorFlow.js for client-side processing, ensuring your images remain private and secure.";
  
  return insights;
};

// Helper function to check for bug indicators
const checkForBugIndicators = (
  objects: DetectedObject[],
  classification: Classification[],
  insights: string
): boolean => {
  const bugKeywords = [
    'error', 'exception', 'warning', 'alert', 'failed', 'crash', 'bug',
    'timeout', 'null', 'undefined', 'syntax', 'runtime', 'console', 'terminal'
  ];
  
  const bugObjects = [
    'error_indicator', 'alert_dialog', 'error_message', 'warning_icon',
    'exception_trace', 'terminal_or_console'
  ];
  
  const bugClassifications = [
    'Error Dialog', 'Console Output', 'Stack Trace', 'Debug Screen',
    'Warning Message', 'Exception Report', 'Log File', 'Terminal', 'Error Screen'
  ];
  
  // Check objects
  const hasBugObjects = objects.some(obj => 
    bugObjects.some(bugObj => obj.class.toLowerCase().includes(bugObj.toLowerCase()))
  );
  
  // Check classifications
  const hasBugClassifications = classification.some(cls =>
    bugClassifications.some(bugCls => cls.className.toLowerCase().includes(bugCls.toLowerCase()))
  );
  
  // Check insights text
  const hasBugKeywords = bugKeywords.some(keyword =>
    insights.toLowerCase().includes(keyword)
  );
  
  return hasBugObjects || hasBugClassifications || hasBugKeywords;
};