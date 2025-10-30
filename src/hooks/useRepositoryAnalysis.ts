import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { githubApi } from "@/services/githubApi";

interface Repository {
  id: number;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  topics?: string[];
  license?: { name: string } | null;
}

interface AnalysisResult {
  analysis: string;
}

export const useRepositoryAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeRepository = async (
    repository: Repository,
    customPrompt?: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Extract owner and repo name from full_name
      const [owner, repo] = repository.full_name.split('/');
      
      // Fetch enhanced repository data
      let enhancedData;
      try {
        enhancedData = await githubApi.getRepositoryAnalysisData(owner, repo);
      } catch (githubError) {
        console.warn("GitHub API failed, using basic data:", githubError);
        enhancedData = { repository, analytics: null };
      }

      // Call Supabase function with enhanced data
      const { data, error: functionError } = await supabase.functions.invoke<AnalysisResult>(
        "analyze-repository",
        {
          body: { 
            repository: enhancedData.repository || repository,
            enhancedData: enhancedData.analytics ? {
              issues: enhancedData.issues,
              commits: enhancedData.commits,
              contributors: enhancedData.contributors,
              languages: enhancedData.languages,
              analytics: enhancedData.analytics
            } : null,
            prompt: customPrompt 
          },
        }
      );

      if (functionError) {
        throw functionError;
      }

      if (!data?.analysis) {
        throw new Error("No analysis received");
      }

      setAnalysis(data.analysis);
      return data.analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze repository";
      setError(errorMessage);
      console.error("Error analyzing repository:", err);
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
    analyzeRepository,
    analysis,
    loading,
    error,
    clearAnalysis,
  };
};
