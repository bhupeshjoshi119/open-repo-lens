import { useState, useEffect } from "react";

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultsCount: number;
}

const MAX_HISTORY_ITEMS = 20;
const STORAGE_KEY = "github-explorer-search-history";

export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading search history:", error);
      }
    }
  }, []);

  const addToHistory = (query: string, resultsCount: number) => {
    const newItem: SearchHistoryItem = {
      query,
      timestamp: Date.now(),
      resultsCount,
    };

    setHistory((prev) => {
      // Remove duplicates and add new item
      const filtered = prev.filter((item) => item.query !== query);
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const removeFromHistory = (query: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.query !== query);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
};
