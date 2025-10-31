import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRepositories } from '@/hooks/useUserRepositories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GitBranch, Star, GitFork, Eye, EyeOff, Building, User, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MyRepositoriesProps {
  onRepositorySelect?: (repo: any) => void;
}

const MyRepositories = ({ onRepositorySelect }: MyRepositoriesProps) => {
  const { isAuthenticated } = useAuth();
  const { repositories, organizations, loading, error, fetchUserRepositories, fetchOrgRepositories } = useUserRepositories();
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [visibility, setVisibility] = useState<'all' | 'public' | 'private'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'pushed' | 'full_name'>('updated');

  useEffect(() => {
    if (isAuthenticated) {
      if (selectedOrg) {
        fetchOrgRepositories(selectedOrg, { 
          type: visibility === 'all' ? 'all' : visibility,
          sort: sortBy,
          direction: 'desc'
        });
      } else {
        fetchUserRepositories({ 
          visibility,
          sort: sortBy,
          direction: 'desc'
        });
      }
    }
  }, [isAuthenticated, selectedOrg, visibility, sortBy]);

  if (!isAuthenticated) {
    return null;
  }

  const handleRepositoryClick = (repo: any) => {
    if (onRepositorySelect) {
      onRepositorySelect(repo);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">My Repositories</h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => fetchUserRepositories()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Repositories</h3>
        <Badge variant="secondary">{repositories.length} repos</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={selectedOrg} onValueChange={setSelectedOrg}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal
              </div>
            </SelectItem>
            {organizations.map((org) => (
              <SelectItem key={org.login} value={org.login}>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {org.login}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={visibility} onValueChange={(value: 'all' | 'public' | 'private') => setVisibility(value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="public">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Public
              </div>
            </SelectItem>
            <SelectItem value="private">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                Private
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: 'updated' | 'created' | 'pushed' | 'full_name') => setSortBy(value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Updated</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="pushed">Pushed</SelectItem>
            <SelectItem value="full_name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Repository List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {repositories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No repositories found</p>
          </div>
        ) : (
          repositories.map((repo) => (
            <Card 
              key={repo.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleRepositoryClick(repo)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{repo.name}</h4>
                    {repo.private && (
                      <Badge variant="secondary" className="text-xs">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                
                {repo.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {repo.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {repo.language && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      {repo.language}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {repo.stargazers_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    {repo.forks_count}
                  </div>
                  <span>Updated {formatDate(repo.updated_at)}</span>
                </div>

                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {repo.topics.slice(0, 3).map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {repo.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{repo.topics.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyRepositories;