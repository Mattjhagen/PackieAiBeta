import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  Shield, 
  Phone, 
  Clock, 
  X, 
  Volume2,
  MapPin,
  User
} from 'lucide-react';

interface ScamAlert {
  id: string;
  type: 'incoming_scam' | 'call_blocked' | 'ai_engaged' | 'fraud_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  phoneNumber?: string;
  location?: string;
  timestamp: Date;
  duration?: number;
  autoClose?: boolean;
  actionRequired?: boolean;
}

interface ScamAlertProps {
  alert: ScamAlert;
  onClose: (id: string) => void;
  onAction?: (id: string, action: string) => void;
}

const alertIcons = {
  incoming_scam: AlertTriangle,
  call_blocked: Shield,
  ai_engaged: Phone,
  fraud_detected: AlertTriangle,
};

const alertColors = {
  low: 'border-blue-200 bg-blue-50 text-blue-900',
  medium: 'border-yellow-200 bg-yellow-50 text-yellow-900',
  high: 'border-orange-200 bg-orange-50 text-orange-900',
  critical: 'border-red-200 bg-red-50 text-red-900',
};

const alertBadgeColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

export function ScamAlert({ alert, onClose, onAction }: ScamAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [progress, setProgress] = useState(100);

  const Icon = alertIcons[alert.type];

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close timer
    if (alert.autoClose !== false) {
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, alert.duration || 5000);

      // Progress bar animation
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / ((alert.duration || 5000) / 100));
          return Math.max(0, newProgress);
        });
      }, 100);

      return () => {
        clearTimeout(timer);
        clearTimeout(autoCloseTimer);
        clearInterval(progressTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [alert.duration, alert.autoClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(alert.id);
    }, 300);
  };

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(alert.id, action);
    }
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-2 shadow-lg transition-all duration-300 transform',
        alertColors[alert.severity],
        isVisible && !isClosing ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95',
        isClosing && 'translate-x-full opacity-0 scale-95'
      )}
    >
      {/* Progress bar */}
      {alert.autoClose !== false && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/10">
          <div 
            className="h-full bg-current transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon with pulse animation for critical alerts */}
          <div className={cn(
            "flex-shrink-0 p-2 rounded-full",
            alert.severity === 'critical' && "animate-pulse",
            alert.severity === 'high' ? 'bg-orange-100' : 
            alert.severity === 'medium' ? 'bg-yellow-100' : 
            alert.severity === 'low' ? 'bg-blue-100' : 'bg-red-100'
          )}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Alert header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-sm">{alert.title}</h4>
                <Badge className={cn("text-xs", alertBadgeColors[alert.severity])}>
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0 hover:bg-black/10"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Alert message */}
            <p className="text-sm opacity-90 mb-3">{alert.message}</p>

            {/* Alert details */}
            <div className="flex flex-wrap items-center gap-3 text-xs opacity-75 mb-3">
              {alert.phoneNumber && (
                <div className="flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>{alert.phoneNumber}</span>
                </div>
              )}
              {alert.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{alert.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{alert.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Action buttons */}
            {alert.actionRequired && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('view_details')}
                  className="text-xs"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAction('take_action')}
                  className="text-xs bg-current hover:bg-current/90"
                >
                  Take Action
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScamAlertContainer() {
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);

  useEffect(() => {
    // WebSocket connection for real-time alerts
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'scam_alert') {
          addAlert(data.alert);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, []);

  const addAlert = (alertData: Omit<ScamAlert, 'id' | 'timestamp'>) => {
    const newAlert: ScamAlert = {
      ...alertData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    setAlerts(prev => [newAlert, ...prev.slice(0, 4)]); // Keep max 5 alerts

    // Play alert sound for critical alerts
    if (alertData.severity === 'critical') {
      playAlertSound();
    }
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const handleAlertAction = (id: string, action: string) => {
    // Handle alert actions
    console.log(`Action ${action} for alert ${id}`);
    
    if (action === 'view_details') {
      // Open alert details modal or navigate to details page
    } else if (action === 'take_action') {
      // Execute the required action
    }
  };

  const playAlertSound = () => {
    // Play a brief alert sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  // Demo function to test alerts
  const addDemoAlert = () => {
    const demoAlerts = [
      {
        type: 'incoming_scam' as const,
        severity: 'critical' as const,
        title: 'Scam Call Detected',
        message: 'Tech support scam from unknown number attempting to target elderly victim',
        phoneNumber: '+1 (555) 123-4567',
        location: 'Unknown Location',
        actionRequired: true,
        autoClose: false,
      },
      {
        type: 'ai_engaged' as const,
        severity: 'medium' as const,
        title: 'AI Response Active',
        message: 'PackieAI "Confused Grandmother" persona is engaging with potential scammer',
        phoneNumber: '+1 (555) 987-6543',
        location: 'Chicago, IL',
        duration: 8000,
      },
      {
        type: 'call_blocked' as const,
        severity: 'low' as const,
        title: 'Call Successfully Blocked',
        message: 'Known scammer number automatically blocked and reported',
        phoneNumber: '+1 (555) 456-7890',
        duration: 5000,
      },
    ];

    const randomAlert = demoAlerts[Math.floor(Math.random() * demoAlerts.length)];
    addAlert(randomAlert);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {/* Demo button - remove in production */}
      <Button
        onClick={addDemoAlert}
        size="sm"
        variant="outline"
        className="mb-2 opacity-50 hover:opacity-100"
      >
        Test Alert
      </Button>

      {alerts.map((alert) => (
        <ScamAlert
          key={alert.id}
          alert={alert}
          onClose={removeAlert}
          onAction={handleAlertAction}
        />
      ))}
    </div>
  );
}