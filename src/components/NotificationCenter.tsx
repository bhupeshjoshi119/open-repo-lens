import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X,
  Download,
  FileText,
  TrendingUp,
  Image,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
  read: boolean;
}

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter = ({ className }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for custom events
    const handlePDFGenerated = (event: CustomEvent) => {
      addNotification({
        type: 'success',
        title: 'PDF Report Generated',
        message: `Successfully generated report for ${event.detail.repository}`,
        action: {
          label: 'Download',
          onClick: () => {
            toast({ description: "PDF download started" });
          }
        }
      });
    };

    const handleAnalysisComplete = (event: CustomEvent) => {
      addNotification({
        type: 'success',
        title: 'Analysis Complete',
        message: `Repository analysis finished for ${event.detail.repository}`,
        action: {
          label: 'View Results',
          onClick: () => {
            toast({ description: "Opening analysis results" });
          }
        }
      });
    };

    const handleImageAnalysisComplete = (event: CustomEvent) => {
      addNotification({
        type: 'info',
        title: 'Image Analysis Complete',
        message: `Found ${event.detail.objectCount} objects in the uploaded image`,
        action: {
          label: 'View Details',
          onClick: () => {
            toast({ description: "Opening image analysis details" });
          }
        }
      });
    };

    const handlePredictionComplete = (event: CustomEvent) => {
      addNotification({
        type: 'info',
        title: 'Prediction Analysis Ready',
        message: `Generated ${event.detail.timeframe} predictions with ${event.detail.confidence}% confidence`,
        action: {
          label: 'View Predictions',
          onClick: () => {
            toast({ description: "Opening prediction results" });
          }
        }
      });
    };

    // Add event listeners
    window.addEventListener('pdf-generated', handlePDFGenerated as EventListener);
    window.addEventListener('analysis-complete', handleAnalysisComplete as EventListener);
    window.addEventListener('image-analysis-complete', handleImageAnalysisComplete as EventListener);
    window.addEventListener('prediction-complete', handlePredictionComplete as EventListener);

    // Add some sample notifications for demonstration
    addNotification({
      type: 'info',
      title: 'Welcome to TechHub',
      message: 'Start by searching for repositories or analyzing existing ones'
    });

    return () => {
      window.removeEventListener('pdf-generated', handlePDFGenerated as EventListener);
      window.removeEventListener('analysis-complete', handleAnalysisComplete as EventListener);
      window.removeEventListener('image-analysis-complete', handleImageAnalysisComplete as EventListener);
      window.removeEventListener('prediction-complete', handlePredictionComplete as EventListener);
    };
  }, [toast]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 notifications
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getActionIcon = (title: string) => {
    if (title.includes('PDF')) return <Download className="w-3 h-3" />;
    if (title.includes('Analysis')) return <FileText className="w-3 h-3" />;
    if (title.includes('Prediction')) return <TrendingUp className="w-3 h-3" />;
    if (title.includes('Image')) return <Image className="w-3 h-3" />;
    return <Sparkles className="w-3 h-3" />;
  };

  return (
    <div className={cn("relative", className)}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 z-50 shadow-lg border">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs"
                >
                  Clear all
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 rounded-lg mb-2 border transition-colors cursor-pointer",
                      notification.read 
                        ? "bg-muted/30 border-border/50" 
                        : "bg-background border-border hover:bg-accent/50"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={cn(
                            "text-sm font-medium truncate",
                            !notification.read && "font-semibold"
                          )}>
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="h-4 w-4 opacity-50 hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {notification.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          
                          {notification.action && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                notification.action!.onClick();
                                markAsRead(notification.id);
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              {getActionIcon(notification.title)}
                              <span className="ml-1">{notification.action.label}</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};