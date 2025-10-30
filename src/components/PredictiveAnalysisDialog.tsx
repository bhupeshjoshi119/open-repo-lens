import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  Brain, 
  Loader2, 
  BarChart3, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  Calendar,
  GitBranch
} from "lucide-react";
import { usePredictiveAnalysis } from "@/hooks/usePredictiveAnalysis";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface PredictiveAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repository?: any;
}

export const PredictiveAnalysisDialog = ({ 
  open, 
  onOpenChange, 
  repository 
}: PredictiveAnalysisDialogProps) => {
  const [analysisType, setAnalysisType] = useState<string>("growth");
  const [timeframe, setTimeframe] = useState<string>("6months");
  const [customRepo, setCustomRepo] = useState<string>("");
  
  const { 
    runPredictiveAnalysis, 
    prediction, 
    loading, 
    error 
  } = usePredictiveAnalysis();

  const handleAnalyze = async () => {
    const repoToAnalyze = repository || { full_name: customRepo };
    if (!repoToAnalyze.full_name) return;
    
    await runPredictiveAnalysis(repoToAnalyze, analysisType, timeframe);
  };

  const analysisTypes = [
    { value: "growth", label: "Growth Prediction", icon: TrendingUp },
    { value: "issues", label: "Issue Trends", icon: AlertTriangle },
    { value: "contributors", label: "Contributor Activity", icon: GitBranch },
    { value: "maintenance", label: "Maintenance Health", icon: CheckCircle2 }
  ];

  const timeframes = [
    { value: "3months", label: "3 Months" },
    { value: "6months", label: "6 Months" },
    { value: "1year", label: "1 Year" },
    { value: "2years", label: "2 Years" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Predictive Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Configuration Panel */}
          <div className="space-y-4">
            <h3 className="font-semibold">Analysis Configuration</h3>
            
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Repository</Label>
                {repository ? (
                  <div className="p-2 bg-muted rounded text-sm">
                    {repository.full_name}
                  </div>
                ) : (
                  <Input
                    placeholder="owner/repository"
                    value={customRepo}
                    onChange={(e) => setCustomRepo(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Analysis Type</Label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {analysisTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prediction Timeframe</Label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframes.map((tf) => (
                      <SelectItem key={tf.value} value={tf.value}>
                        {tf.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={loading || (!repository && !customRepo)}
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
                    Run Analysis
                  </>
                )}
              </Button>
            </Card>

            {/* Quick Stats */}
            {prediction && (
              <Card className="p-4">
                <h4 className="font-medium mb-3">Key Predictions</h4>
                <div className="space-y-3">
                  {prediction.keyMetrics?.map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{metric.label}</span>
                      <Badge 
                        variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                      >
                        {metric.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold">Prediction Results</h3>
            
            <ScrollArea className="h-[600px]">
              {loading && (
                <Card className="p-8 text-center">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-lg font-medium mb-2">Running Predictive Analysis</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Analyzing historical data and trends...
                  </p>
                  <Progress value={65} className="max-w-xs mx-auto" />
                </Card>
              )}

              {error && (
                <Card className="p-4 border-destructive/50 bg-destructive/10">
                  <p className="text-sm text-destructive">{error}</p>
                </Card>
              )}

              {prediction && !loading && (
                <div className="space-y-6">
                  {/* Trend Chart */}
                  {prediction.chartData && (
                    <Card className="p-6">
                      <h4 className="font-medium mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Trend Visualization
                      </h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          {prediction.chartType === 'line' ? (
                            <LineChart data={prediction.chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="period" />
                              <YAxis />
                              <Tooltip />
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={2}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="predicted" 
                                stroke="hsl(var(--accent))" 
                                strokeWidth={2}
                                strokeDasharray="5 5"
                              />
                            </LineChart>
                          ) : (
                            <BarChart data={prediction.chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="period" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill="hsl(var(--primary))" />
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  )}

                  {/* Confidence Score */}
                  {prediction.confidence && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Prediction Confidence</h4>
                        <Badge variant="outline">
                          {Math.round(prediction.confidence * 100)}%
                        </Badge>
                      </div>
                      <Progress value={prediction.confidence * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        Based on {prediction.dataPoints || 0} historical data points
                      </p>
                    </Card>
                  )}

                  {/* Insights */}
                  {prediction.insights && (
                    <Card className="p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        AI Insights
                      </h4>
                      <div className="space-y-3">
                        {prediction.insights.map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className={`p-1 rounded-full ${
                              insight.type === 'positive' ? 'bg-green-100 text-green-600' :
                              insight.type === 'negative' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {insight.type === 'positive' ? <CheckCircle2 className="w-3 h-3" /> :
                               insight.type === 'negative' ? <AlertTriangle className="w-3 h-3" /> :
                               <TrendingUp className="w-3 h-3" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{insight.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {insight.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Recommendations */}
                  {prediction.recommendations && (
                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {prediction.recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            <p>{rec}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {!prediction && !loading && !error && (
                <Card className="p-8 text-center">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Ready for Analysis</p>
                  <p className="text-muted-foreground">
                    Configure your analysis parameters and click "Run Analysis" to get started
                  </p>
                </Card>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};