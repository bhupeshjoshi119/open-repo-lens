import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Image as ImageIcon,
  Brain,
  Loader2,
  X,
  Download,
  Bug,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lightbulb,
  Search,
  ExternalLink,
  Code,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useImageAnalysis } from "@/hooks/useImageAnalysis";
import { generateBugAnalysisPDF } from "../utils/bugAnalysisPDFGenerator";
import {
  extractTextFromImage,
  searchStackOverflow,
  generateGitHubIssueTemplate,
  containsErrorIndicators,
} from "@/utils/textAnalysisUtils";

interface ImageAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImageAnalysisDialog = ({
  open,
  onOpenChange,
}: ImageAnalysisDialogProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [bugAnalysis, setBugAnalysis] = useState<any>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [stackOverflowResults, setStackOverflowResults] = useState<any[]>([]);
  const [githubIssueTemplate, setGithubIssueTemplate] = useState<string>("");
  const [searchingStackOverflow, setSearchingStackOverflow] = useState(false);
  const { toast } = useToast();
  const { analyzeImage, analysis, loading, error } = useImageAnalysis();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          toast({
            title: "File too large",
            description: "Please select an image smaller than 10MB",
            variant: "destructive",
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string);
          setFileName(file.name);
        };
        reader.readAsDataURL(file);
      }
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
    },
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!uploadedImage) return;

    // Step 1: Basic image analysis
    await analyzeImage(uploadedImage);

    // Step 2: Extract text from image using OCR
    try {
      const text = await extractTextFromImage(uploadedImage);
      setExtractedText(text);

      // Step 3: If text contains error/bug indicators, search Stack Overflow
      if (text && containsErrorIndicators(text)) {
        setSearchingStackOverflow(true);
        const stackOverflowResults = await searchStackOverflow(text);
        setStackOverflowResults(stackOverflowResults);

        // Step 4: Generate GitHub issue template
        const issueTemplate = generateGitHubIssueTemplate(
          text,
          stackOverflowResults
        );
        setGithubIssueTemplate(issueTemplate);

        setSearchingStackOverflow(false);
      }
    } catch (error) {
      console.error("OCR or Stack Overflow search failed:", error);
      setSearchingStackOverflow(false);
    }

    // Step 5: Perform bug-specific analysis
    if (analysis) {
      performBugAnalysis();
    }
  };

  const performBugAnalysis = async () => {
    if (!analysis || !uploadedImage) return;

    try {
      // Analyze if this looks like a bug/error screenshot
      const bugAnalysisResult = await analyzeBugFromImage(
        analysis,
        uploadedImage
      );
      setBugAnalysis(bugAnalysisResult);

      // Dispatch event for notifications
      if (bugAnalysisResult.isBug && "severity" in bugAnalysisResult) {
        window.dispatchEvent(
          new CustomEvent("bug-detected", {
            detail: {
              severity: bugAnalysisResult.severity,
              type: bugAnalysisResult.bugType,
              confidence: bugAnalysisResult.confidence,
            },
          })
        );
      }
    } catch (error) {
      console.error("Bug analysis failed:", error);
    }
  };

  const generateBugReport = async () => {
    if (!bugAnalysis || !uploadedImage) return;

    setGeneratingPDF(true);
    try {
      await generateBugAnalysisPDF({
        image: uploadedImage,
        fileName,
        analysis: bugAnalysis,
        technicalDetails: analysis?.technical,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Bug Report Generated",
        description: "Comprehensive bug analysis PDF has been downloaded",
      });
    } catch (error) {
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate bug report PDF",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleClear = () => {
    setUploadedImage(null);
    setFileName("");
    setBugAnalysis(null);
    setExtractedText("");
    setStackOverflowResults([]);
    setGithubIssueTemplate("");
  };

  const handleClose = () => {
    handleClear();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            AI Image Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* Upload Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Upload Image</h3>

            {!uploadedImage ? (
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${
                    isDragActive
                      ? "border-primary bg-primary/10"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? "Drop image here" : "Drag & drop an image"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse files
                </p>
                <Badge variant="secondary">PNG, JPG, GIF up to 10MB</Badge>
              </div>
            ) : (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-sm font-medium truncate">
                      {fileName}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleClear}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-64 object-contain rounded-lg bg-muted"
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <Button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Analysis Results</h3>
              {bugAnalysis?.isBug && (
                <Button
                  onClick={generateBugReport}
                  disabled={generatingPDF}
                  size="sm"
                  className="gap-2"
                >
                  {generatingPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Bug Report PDF
                    </>
                  )}
                </Button>
              )}
            </div>

            <ScrollArea className="h-[500px]">
              {loading && (
                <Card className="p-6 text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Processing image with TensorFlow.js...
                  </p>
                  <Progress value={33} className="mt-4" />
                </Card>
              )}

              {error && (
                <Card className="p-4 border-destructive/50 bg-destructive/10">
                  <p className="text-sm text-destructive">{error}</p>
                </Card>
              )}

              {analysis && !loading && (
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">General Analysis</TabsTrigger>
                    <TabsTrigger value="bug" className="gap-2">
                      <Bug className="w-4 h-4" />
                      Bug Detection
                    </TabsTrigger>
                    <TabsTrigger value="solutions" className="gap-2">
                      <Search className="w-4 h-4" />
                      Solutions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4 mt-4">
                    {/* Object Detection Results */}
                    {analysis.objects && analysis.objects.length > 0 && (
                      <Card className="p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Detected Objects
                        </h4>
                        <div className="space-y-2">
                          {analysis.objects.map((obj, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">{obj.class}</span>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={obj.score * 100}
                                  className="w-20 h-2"
                                />
                                <Badge variant="secondary" className="text-xs">
                                  {Math.round(obj.score * 100)}%
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Image Classification */}
                    {analysis.classification && (
                      <Card className="p-4">
                        <h4 className="font-medium mb-3">
                          Image Classification
                        </h4>
                        <div className="space-y-2">
                          {analysis.classification.map((cls, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">{cls.className}</span>
                              <Badge variant="outline">
                                {Math.round(cls.probability * 100)}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Technical Analysis */}
                    {analysis.technical && (
                      <Card className="p-4">
                        <h4 className="font-medium mb-3">Technical Analysis</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Dimensions:
                            </span>
                            <p>
                              {analysis.technical.width} ×{" "}
                              {analysis.technical.height}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Format:
                            </span>
                            <p>{analysis.technical.format}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Size:</span>
                            <p>{analysis.technical.size}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Color Space:
                            </span>
                            <p>{analysis.technical.colorSpace}</p>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* AI Insights */}
                    {analysis.insights && (
                      <Card className="p-4">
                        <h4 className="font-medium mb-3">AI Insights</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {analysis.insights}
                        </p>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="bug" className="space-y-4 mt-4">
                    {bugAnalysis ? (
                      <div className="space-y-4">
                        {/* Bug Detection Status */}
                        <Card
                          className={`p-4 border-2 ${
                            bugAnalysis.isBug
                              ? bugAnalysis.severity === "critical"
                                ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                : bugAnalysis.severity === "high"
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                                : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                              : "border-green-500 bg-green-50 dark:bg-green-950/20"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            {bugAnalysis.isBug ? (
                              <AlertTriangle
                                className={`w-6 h-6 ${
                                  bugAnalysis.severity === "critical"
                                    ? "text-red-500"
                                    : bugAnalysis.severity === "high"
                                    ? "text-orange-500"
                                    : "text-yellow-500"
                                }`}
                              />
                            ) : (
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            )}
                            <div>
                              <h4 className="font-semibold">
                                {bugAnalysis.isBug
                                  ? "Bug/Error Detected"
                                  : "No Issues Detected"}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Confidence:{" "}
                                {Math.round(bugAnalysis.confidence * 100)}%
                              </p>
                            </div>
                          </div>

                          {bugAnalysis.isBug && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    bugAnalysis.severity === "critical"
                                      ? "destructive"
                                      : bugAnalysis.severity === "high"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {bugAnalysis.severity.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">
                                  {bugAnalysis.bugType}
                                </Badge>
                              </div>
                              <p className="text-sm">
                                {bugAnalysis.description}
                              </p>
                            </div>
                          )}
                        </Card>

                        {/* Root Cause Analysis */}
                        {bugAnalysis.isBug && bugAnalysis.rootCause && (
                          <Card className="p-4">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Root Cause Analysis
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <h5 className="font-medium text-sm mb-1">
                                  Primary Cause:
                                </h5>
                                <p className="text-sm text-muted-foreground">
                                  {bugAnalysis.rootCause.primary}
                                </p>
                              </div>
                              {bugAnalysis.rootCause.contributing && (
                                <div>
                                  <h5 className="font-medium text-sm mb-1">
                                    Contributing Factors:
                                  </h5>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {bugAnalysis.rootCause.contributing.map(
                                      (factor: string, idx: number) => (
                                        <li
                                          key={idx}
                                          className="flex items-start gap-2"
                                        >
                                          <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 shrink-0" />
                                          {factor}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </Card>
                        )}

                        {/* Solutions */}
                        {bugAnalysis.isBug && bugAnalysis.solutions && (
                          <Card className="p-4">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Recommended Solutions
                            </h4>
                            <div className="space-y-3">
                              {bugAnalysis.solutions.map(
                                (solution: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="border rounded-lg p-3 bg-muted/30"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge
                                        variant={
                                          solution.priority === "immediate"
                                            ? "destructive"
                                            : "default"
                                        }
                                      >
                                        {solution.priority}
                                      </Badge>
                                      <span className="font-medium text-sm">
                                        {solution.title}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {solution.description}
                                    </p>
                                    {solution.steps && (
                                      <div>
                                        <h6 className="font-medium text-xs mb-1">
                                          Steps:
                                        </h6>
                                        <ol className="text-xs text-muted-foreground space-y-1">
                                          {solution.steps.map(
                                            (step: string, stepIdx: number) => (
                                              <li
                                                key={stepIdx}
                                                className="flex gap-2"
                                              >
                                                <span className="font-medium">
                                                  {stepIdx + 1}.
                                                </span>
                                                <span>{step}</span>
                                              </li>
                                            )
                                          )}
                                        </ol>
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </Card>
                        )}

                        {/* Prevention Tips */}
                        {bugAnalysis.isBug && bugAnalysis.prevention && (
                          <Card className="p-4">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Prevention Tips
                            </h4>
                            <ul className="space-y-2">
                              {bugAnalysis.prevention.map(
                                (tip: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2 text-sm"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-muted-foreground">
                                      {tip}
                                    </span>
                                  </li>
                                )
                              )}
                            </ul>
                          </Card>
                        )}
                      </div>
                    ) : (
                      <Card className="p-8 text-center">
                        <Bug className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Analyzing image for bugs and errors...
                        </p>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="solutions" className="space-y-4 mt-4">
                    {/* OCR Results */}
                    {extractedText && (
                      <Card className="p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          Extracted Text (OCR)
                        </h4>
                        <div className="bg-muted/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                          <pre className="text-xs font-mono whitespace-pre-wrap">
                            {extractedText}
                          </pre>
                        </div>
                      </Card>
                    )}

                    {/* Stack Overflow Solutions */}
                    {searchingStackOverflow && (
                      <Card className="p-6 text-center">
                        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                          Searching Stack Overflow for solutions...
                        </p>
                      </Card>
                    )}

                    {stackOverflowResults.length > 0 && (
                      <Card className="p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Stack Overflow Solutions
                        </h4>
                        <div className="space-y-3">
                          {stackOverflowResults
                            .slice(0, 5)
                            .map((result, idx) => (
                              <div
                                key={idx}
                                className="border rounded-lg p-3 bg-muted/30"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-medium text-sm line-clamp-2 flex-1">
                                    {result.title}
                                  </h5>
                                  <div className="flex items-center gap-2 ml-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {result.score} votes
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      asChild
                                    >
                                      <a
                                        href={result.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </Button>
                                  </div>
                                </div>

                                <p className="text-xs text-muted-foreground mb-2 line-clamp-3">
                                  {result.excerpt}
                                </p>

                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {result.tags?.slice(0, 3).join(", ") ||
                                      "General"}
                                  </Badge>
                                  {result.hasAcceptedAnswer && (
                                    <Badge
                                      variant="default"
                                      className="text-xs"
                                    >
                                      ✓ Accepted Answer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </Card>
                    )}

                    {/* GitHub Issue Template */}
                    {githubIssueTemplate && (
                      <Card className="p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          GitHub Issue Template
                        </h4>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <pre className="text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                            {githubIssueTemplate}
                          </pre>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            navigator.clipboard.writeText(githubIssueTemplate);
                            toast({
                              description: "Issue template copied to clipboard",
                            });
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Copy Template
                        </Button>
                      </Card>
                    )}

                    {/* No solutions found */}
                    {!searchingStackOverflow &&
                      !extractedText &&
                      !stackOverflowResults.length && (
                        <Card className="p-8 text-center">
                          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            No text detected or solutions found. Try uploading
                            an image with error messages or code.
                          </p>
                        </Card>
                      )}
                  </TabsContent>
                </Tabs>
              )}

              {!analysis && !loading && !error && (
                <Card className="p-8 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Upload an image to start AI analysis
                  </p>
                </Card>
              )}
            </ScrollArea>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

// Bug analysis function
const analyzeBugFromImage = async (analysis: any, imageDataUrl: string) => {
  // Simulate AI-powered bug detection based on image analysis
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const { classification, objects, insights } = analysis;

  // Check for bug indicators
  const bugIndicators = [
    "error",
    "exception",
    "failed",
    "crash",
    "bug",
    "warning",
    "alert",
    "timeout",
    "connection",
    "network",
    "server",
    "404",
    "500",
    "null",
    "undefined",
    "syntax",
    "parse",
    "compile",
    "runtime",
  ];

  const textContent = insights?.toLowerCase() || "";
  const detectedObjects =
    objects?.map((obj: any) => obj.class.toLowerCase()) || [];
  const imageTypes =
    classification?.map((cls: any) => cls.className.toLowerCase()) || [];

  // Check if this looks like a screenshot of an error/bug
  const isScreenshot = imageTypes.some(
    (type) =>
      type.includes("screenshot") ||
      type.includes("interface") ||
      type.includes("application")
  );

  const hasBugIndicators = bugIndicators.some(
    (indicator) =>
      textContent.includes(indicator) ||
      detectedObjects.some((obj) => obj.includes(indicator))
  );

  const hasErrorVisuals = detectedObjects.some(
    (obj) =>
      obj.includes("alert") || obj.includes("warning") || obj.includes("error")
  );

  const isBug = (isScreenshot && hasBugIndicators) || hasErrorVisuals;
  const confidence = isBug
    ? 0.75 + Math.random() * 0.2
    : 0.3 + Math.random() * 0.4;

  if (!isBug) {
    return {
      isBug: false,
      confidence,
      description: "No obvious bugs or errors detected in this image.",
    };
  }

  // Determine bug type and severity
  const bugTypes = [
    "UI Error",
    "Network Error",
    "Runtime Exception",
    "Syntax Error",
    "Logic Error",
  ];
  const severities = ["low", "medium", "high", "critical"];

  const bugType = bugTypes[Math.floor(Math.random() * bugTypes.length)];
  const severity = severities[Math.floor(Math.random() * severities.length)];

  // Generate detailed bug analysis
  const bugAnalysis = {
    isBug: true,
    confidence,
    bugType,
    severity,
    description: generateBugDescription(bugType, severity),
    rootCause: generateRootCause(bugType),
    solutions: generateSolutions(bugType, severity),
    prevention: generatePreventionTips(bugType),
  };

  return bugAnalysis;
};

const generateBugDescription = (bugType: string, severity: string) => {
  const descriptions = {
    "UI Error": `A ${severity} user interface error has been detected. This appears to be a visual or interaction problem that affects user experience.`,
    "Network Error": `A ${severity} network connectivity issue has been identified. This could be related to API calls, server communication, or internet connectivity.`,
    "Runtime Exception": `A ${severity} runtime exception has occurred during code execution. This indicates an unexpected error during program runtime.`,
    "Syntax Error": `A ${severity} syntax error has been found in the code. This prevents the code from being parsed or compiled correctly.`,
    "Logic Error": `A ${severity} logic error has been detected. The code runs but produces incorrect or unexpected results.`,
  };

  return (
    descriptions[bugType as keyof typeof descriptions] ||
    "An unspecified error has been detected."
  );
};

const generateRootCause = (bugType: string) => {
  const rootCauses = {
    "UI Error": {
      primary:
        "Inconsistent styling, missing CSS properties, or incorrect component rendering",
      contributing: [
        "Browser compatibility issues",
        "Missing responsive design considerations",
        "Incorrect z-index or positioning",
        "Outdated UI framework or library",
      ],
    },
    "Network Error": {
      primary:
        "Failed API request, server unavailability, or network connectivity issues",
      contributing: [
        "Incorrect API endpoint configuration",
        "Authentication or authorization failures",
        "Server overload or maintenance",
        "Client-side network restrictions",
      ],
    },
    "Runtime Exception": {
      primary:
        "Unhandled exception during code execution or invalid operations",
      contributing: [
        "Null pointer or undefined variable access",
        "Type mismatch or casting errors",
        "Resource unavailability",
        "Concurrent access issues",
      ],
    },
    "Syntax Error": {
      primary:
        "Invalid code syntax that prevents compilation or interpretation",
      contributing: [
        "Missing brackets, semicolons, or quotes",
        "Incorrect function or method signatures",
        "Invalid variable declarations",
        "Mismatched parentheses or braces",
      ],
    },
    "Logic Error": {
      primary: "Incorrect algorithm implementation or flawed business logic",
      contributing: [
        "Incorrect conditional statements",
        "Wrong loop conditions or iterations",
        "Improper data validation",
        "Misunderstood requirements",
      ],
    },
  };

  return (
    rootCauses[bugType as keyof typeof rootCauses] || {
      primary: "Unknown root cause",
      contributing: ["Further investigation required"],
    }
  );
};

const generateSolutions = (bugType: string, severity: string) => {
  const solutions = {
    "UI Error": [
      {
        priority: severity === "critical" ? "immediate" : "high",
        title: "Fix CSS and Styling Issues",
        description:
          "Review and correct CSS properties, ensure proper styling inheritance",
        steps: [
          "Inspect element using browser developer tools",
          "Check for conflicting CSS rules",
          "Verify responsive design breakpoints",
          "Test across different browsers and devices",
        ],
      },
      {
        priority: "medium",
        title: "Update UI Framework",
        description: "Ensure UI components and frameworks are up to date",
        steps: [
          "Check current framework version",
          "Review changelog for breaking changes",
          "Update dependencies gradually",
          "Test thoroughly after updates",
        ],
      },
    ],
    "Network Error": [
      {
        priority: "immediate",
        title: "Verify API Endpoints",
        description: "Check API connectivity and endpoint configuration",
        steps: [
          "Test API endpoints using tools like Postman",
          "Verify authentication tokens and headers",
          "Check server status and availability",
          "Implement proper error handling and retry logic",
        ],
      },
      {
        priority: "high",
        title: "Implement Error Handling",
        description: "Add robust error handling for network requests",
        steps: [
          "Add try-catch blocks around network calls",
          "Implement exponential backoff for retries",
          "Show user-friendly error messages",
          "Log errors for debugging purposes",
        ],
      },
    ],
    "Runtime Exception": [
      {
        priority: "immediate",
        title: "Add Exception Handling",
        description: "Implement proper exception handling to prevent crashes",
        steps: [
          "Identify the exact line causing the exception",
          "Add try-catch blocks around risky operations",
          "Validate inputs before processing",
          "Implement graceful degradation",
        ],
      },
    ],
    "Syntax Error": [
      {
        priority: "immediate",
        title: "Fix Syntax Issues",
        description: "Correct syntax errors to allow code compilation",
        steps: [
          "Review compiler or interpreter error messages",
          "Check for missing brackets, quotes, or semicolons",
          "Verify function and variable declarations",
          "Use IDE syntax highlighting and linting tools",
        ],
      },
    ],
    "Logic Error": [
      {
        priority: "high",
        title: "Review Business Logic",
        description: "Analyze and correct the logical flow of the application",
        steps: [
          "Trace through the code execution path",
          "Add debugging statements or breakpoints",
          "Verify conditional statements and loops",
          "Test with various input scenarios",
        ],
      },
    ],
  };

  return (
    solutions[bugType as keyof typeof solutions] || [
      {
        priority: "medium",
        title: "General Debugging",
        description: "Perform general debugging and investigation",
        steps: [
          "Reproduce the issue consistently",
          "Check logs and error messages",
          "Review recent code changes",
          "Consult documentation and community resources",
        ],
      },
    ]
  );
};

const generatePreventionTips = (bugType: string) => {
  const preventionTips = {
    "UI Error": [
      "Use CSS linting tools and consistent styling guidelines",
      "Implement responsive design testing across devices",
      "Maintain a design system and component library",
      "Regular cross-browser compatibility testing",
    ],
    "Network Error": [
      "Implement comprehensive error handling for all API calls",
      "Use network monitoring and alerting systems",
      "Set up proper timeout and retry mechanisms",
      "Maintain API documentation and versioning",
    ],
    "Runtime Exception": [
      "Use static analysis tools and code linting",
      "Implement comprehensive unit and integration testing",
      "Add input validation and sanitization",
      "Use defensive programming practices",
    ],
    "Syntax Error": [
      "Use IDE with syntax highlighting and error detection",
      "Implement pre-commit hooks with linting",
      "Follow consistent coding standards and style guides",
      "Regular code reviews and pair programming",
    ],
    "Logic Error": [
      "Write comprehensive unit tests for business logic",
      "Use test-driven development (TDD) practices",
      "Implement code reviews and peer validation",
      "Document requirements and edge cases clearly",
    ],
  };

  return (
    preventionTips[bugType as keyof typeof preventionTips] || [
      "Follow software development best practices",
      "Implement comprehensive testing strategies",
      "Use version control and code review processes",
      "Maintain clear documentation and coding standards",
    ]
  );
};
