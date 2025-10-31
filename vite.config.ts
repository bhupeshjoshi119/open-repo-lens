import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { githubOAuthProxy } from "./vite-github-proxy.js";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Set environment variables for the proxy
  process.env.VITE_GITHUB_CLIENT_ID = env.VITE_GITHUB_CLIENT_ID;
  process.env.VITE_GITHUB_CLIENT_SECRET = env.VITE_GITHUB_CLIENT_SECRET;
  process.env.VITE_GITHUB_REDIRECT_URI = env.VITE_GITHUB_REDIRECT_URI;

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(), 
      mode === "development" && componentTagger(),
      mode === "development" && githubOAuthProxy()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
