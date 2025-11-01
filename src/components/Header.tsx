import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { TechHubLogo } from "./TechHubLogo";
import type { User, Session } from "@supabase/supabase-js";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        description: "Successfully signed out",
      });
      navigate("/auth");
    }
  };

  if (!user) {
    return null;
  }

  const userMetadata = user.user_metadata;
  const avatarUrl = userMetadata?.avatar_url;
  const fullName = userMetadata?.full_name || userMetadata?.name;
  const username = userMetadata?.user_name || user.email?.split("@")[0];

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <TechHubLogo size={28} className="text-primary" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-foreground">TechHub</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">Powered by Open Source</span>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <Button
              variant={location.pathname === "/" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => navigate("/")}
            >
              Search
            </Button>
            <Button
              variant={location.pathname === "/ai-tools" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => navigate("/ai-tools")}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Tools
            </Button>
          </nav>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback>
                  {username?.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{fullName || username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
