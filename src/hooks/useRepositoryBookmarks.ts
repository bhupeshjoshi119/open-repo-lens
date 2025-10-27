import { useState, useEffect } from "react";
import { Repository } from "@/pages/Index";

const BOOKMARKS_KEY = "github-repo-bookmarks";

export const useRepositoryBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Repository[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(BOOKMARKS_KEY);
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading bookmarks:", error);
      }
    }
  }, []);

  const saveBookmarks = (newBookmarks: Repository[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
  };

  const addBookmark = (repo: Repository) => {
    const updated = [...bookmarks, repo];
    saveBookmarks(updated);
  };

  const removeBookmark = (repoId: number) => {
    const updated = bookmarks.filter((r) => r.id !== repoId);
    saveBookmarks(updated);
  };

  const isBookmarked = (repoId: number) => {
    return bookmarks.some((r) => r.id === repoId);
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
  };
};
