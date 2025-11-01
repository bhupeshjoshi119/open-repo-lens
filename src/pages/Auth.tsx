import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TechHubLogo } from "@/components/TechHubLogo";
import { CodeIcon } from "@/components/icons/CodeIcon";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        toast({
          title: "Welcome!",
          description: "Successfully signed in with GitHub",
        });
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleGitHubSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/`,
          scopes: "user repo read:org",
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <TechHubLogo size={48} className="text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome to TechHub</CardTitle>
          <CardDescription className="text-center">
            Powered by Open Source • Sign in with GitHub to discover and analyze repositories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGitHubSignIn}
            className="w-full"
            size="lg"
            variant="default"
          >
            <CodeIcon className="mr-2" size={20} />
            Continue with GitHub
          </Button>
          
          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p>By signing in, you'll be able to:</p>
            <ul className="text-left space-y-1 ml-6">
              <li>• Search and analyze public repositories</li>
              <li>• Access your private repositories</li>
              <li>• View issues in your personal projects</li>
              <li>• Contribute to open source projects</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
