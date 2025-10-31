import { useLocation } from 'react-router-dom';

const Test = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Test Page</h1>
        <p className="text-muted-foreground">Current path: {location.pathname}</p>
        <p className="text-muted-foreground">Search params: {location.search}</p>
        <p className="text-muted-foreground">Environment: {import.meta.env.MODE}</p>
        <a href="/" className="text-primary underline">Go Home</a>
      </div>
    </div>
  );
};

export default Test;