import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SearchEnhancement {
  enhancedQuery: string;
  filters: string[];
  explanation: string;
}

export const useAISearch = () => {
  const [loading, setLoading] = useState(false);
  const [enhancement, setEnhancement] = useState<SearchEnhancement | null>(null);

  const enhanceSearch = async (query: string): Promise<SearchEnhancement | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-search", {
        body: { query },
      });

      if (error) throw error;

      setEnhancement(data);
      return data;
    } catch (error) {
      console.error("Error enhancing search:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    enhanceSearch,
    enhancement,
    loading,
  };
};
