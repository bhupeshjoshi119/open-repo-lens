import { useLocation } from 'react-router-dom';
import { ResearchSimplifier } from '@/components/ResearchSimplifier';

const Test = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Chrome AI Research Simplifier Test</h1>
          <p className="text-muted-foreground">Test the new Chrome AI features</p>
          <a href="/" className="text-primary underline">Go Home</a>
        </div>
        
        <div className="border rounded-lg p-6">
          <ResearchSimplifier />
        </div>
      </div>
    </div>
  );
};

export default Test;