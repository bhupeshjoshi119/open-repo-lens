import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Palette, 
  Bell, 
  Zap, 
  Shield, 
  Download,
  Eye,
  Moon,
  Sun,
  Monitor,
  Sparkles,
  Database,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsPanelProps {
  className?: string;
}

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  autoAnalysis: boolean;
  aiEnhancement: boolean;
  cacheEnabled: boolean;
  animationsEnabled: boolean;
  compactMode: boolean;
  autoSave: boolean;
  analysisDepth: number;
  refreshInterval: number;
  maxResults: number;
}

export const SettingsPanel = ({ className }: SettingsPanelProps) => {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    notifications: true,
    autoAnalysis: false,
    aiEnhancement: true,
    cacheEnabled: true,
    animationsEnabled: true,
    compactMode: false,
    autoSave: true,
    analysisDepth: 3,
    refreshInterval: 30,
    maxResults: 50
  });

  const [activeTab, setActiveTab] = useState<string>("general");
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('techhub-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const updateSetting = <K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('techhub-settings', JSON.stringify(newSettings));
    
    // Apply theme changes immediately
    if (key === 'theme') {
      applyTheme(value as string);
    }
    
    toast({
      description: `${key.charAt(0).toUpperCase() + key.slice(1)} updated`,
    });
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const resetSettings = () => {
    const defaultSettings: AppSettings = {
      theme: 'system',
      notifications: true,
      autoAnalysis: false,
      aiEnhancement: true,
      cacheEnabled: true,
      animationsEnabled: true,
      compactMode: false,
      autoSave: true,
      analysisDepth: 3,
      refreshInterval: 30,
      maxResults: 50
    };
    
    setSettings(defaultSettings);
    localStorage.setItem('techhub-settings', JSON.stringify(defaultSettings));
    applyTheme(defaultSettings.theme);
    
    toast({
      description: "Settings reset to defaults",
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'techhub-settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      description: "Settings exported successfully",
    });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="flex-1"
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="space-y-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">General Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto Analysis</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically analyze repositories when opened
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoAnalysis}
                    onCheckedChange={(checked) => updateSetting('autoAnalysis', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">AI Enhancement</Label>
                    <p className="text-xs text-muted-foreground">
                      Use AI to enhance search queries and analysis
                    </p>
                  </div>
                  <Switch
                    checked={settings.aiEnhancement}
                    onCheckedChange={(checked) => updateSetting('aiEnhancement', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto Save</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically save bookmarks and preferences
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Analysis Depth</Label>
                  <p className="text-xs text-muted-foreground">
                    How detailed should the AI analysis be (1-5)
                  </p>
                  <Slider
                    value={[settings.analysisDepth]}
                    onValueChange={([value]) => updateSetting('analysisDepth', value)}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Basic</span>
                    <span>Comprehensive</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Max Results</Label>
                  <Select
                    value={settings.maxResults.toString()}
                    onValueChange={(value) => updateSetting('maxResults', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25 results</SelectItem>
                      <SelectItem value="50">50 results</SelectItem>
                      <SelectItem value="100">100 results</SelectItem>
                      <SelectItem value="200">200 results</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Appearance</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Theme</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: 'light' | 'dark' | 'system') => updateSetting('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Animations</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable smooth animations and transitions
                    </p>
                  </div>
                  <Switch
                    checked={settings.animationsEnabled}
                    onCheckedChange={(checked) => updateSetting('animationsEnabled', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Compact Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Use a more compact layout to show more content
                    </p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Notifications</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Show notifications for completed analyses and updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => updateSetting('notifications', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Refresh Interval</Label>
                  <p className="text-xs text-muted-foreground">
                    How often to check for updates (in seconds)
                  </p>
                  <Select
                    value={settings.refreshInterval.toString()}
                    onValueChange={(value) => updateSetting('refreshInterval', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="0">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable Caching</Label>
                    <p className="text-xs text-muted-foreground">
                      Cache API responses for faster loading
                    </p>
                  </div>
                  <Switch
                    checked={settings.cacheEnabled}
                    onCheckedChange={(checked) => updateSetting('cacheEnabled', checked)}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Cache Size</span>
                    </div>
                    <div className="text-2xl font-bold">2.4 MB</div>
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      Clear Cache
                    </Button>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">AI Requests</span>
                    </div>
                    <div className="text-2xl font-bold">47</div>
                    <Badge variant="secondary" className="mt-2">
                      This month
                    </Badge>
                  </Card>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Privacy & Security</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Data Processing</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All image analysis is performed locally in your browser. 
                    No images are sent to external servers.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">API</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Repository data is fetched directly from GitHub. 
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button onClick={exportSettings} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export Settings
          </Button>
          <Button onClick={resetSettings} variant="outline" className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
};