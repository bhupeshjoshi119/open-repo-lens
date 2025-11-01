import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ImageAnalysisResult {
  analysis: string;
}

export const useImageAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (
    imageFile: File,
    repositoryName: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const { data, error: functionError } = await supabase.functions.invoke<ImageAnalysisResult>(
        "analyze-issue-screenshot",
        {
          body: { 
            imageBase64: base64,
            repositoryName 
          },
        }
      );

      if (functionError) {
        console.error("Function invocation error:", functionError);
        throw new Error(functionError.message || "Failed to connect to analysis service");
      }

      if (data && 'error' in data) {
        throw new Error((data as any).error);
      }

      if (!data?.analysis) {
        throw new Error("No analysis received from the service");
      }

      setAnalysis(data.analysis);
      return data.analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze image";
      setError(errorMessage);
      console.error("Error analyzing image:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setError(null);
  };

  return {
    analyzeImage,
    analysis,
    loading,
    error,
    clearAnalysis,
  };
};
