import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Github, Lock, Users, GitBranch } from 'lucide-react';

const GitHubLogin = () => {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Github className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Connect with GitHub</CardTitle>
          <CardDescription>
            Sign in with your GitHub account to access private repositories and enhanced features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Access your private repositories</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>View organization repositories</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span>Enhanced repository analytics</span>
            </div>
          </div>
          
          <Button 
            onClick={login} 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            <Github className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            We only request the minimum permissions needed to analyze your repositories.
            You can revoke access at any time in your GitHub settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GitHubLogin;