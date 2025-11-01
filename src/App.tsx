import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import AuthCallback from "./pages/AuthCallback";
import Test from "./pages/Test";
import { ChromeAiDemo } from "./pages/ChromeAiDemo";
import { ProofreadingStudioPage } from "./pages/ProofreadingStudioPage";
import { AiToolsPage } from "./pages/AiToolsPage";
import { ChromeAiDashboard } from "./components/ChromeAiDashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/test" element={<Test />} />
            <Route path="/chrome-ai-demo" element={<ChromeAiDemo />} />
            <Route path="/ai-tools" element={
              <ErrorBoundary>
                <AiToolsPage />
              </ErrorBoundary>
            } />
            <Route path="/ai-dashboard" element={
              <ErrorBoundary>
                <div className="container mx-auto p-6"><ChromeAiDashboard /></div>
              </ErrorBoundary>
            } />
            <Route path="/proofreading" element={<ProofreadingStudioPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
