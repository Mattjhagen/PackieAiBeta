import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Phone, 
  Clock, 
  Shield, 
  TrendingUp,
  Activity,
  Zap,
  Timer
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Add custom styles for animations
const customStyles = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes glow {
    from {
      box-shadow: 0 0 5px rgba(34, 197, 94, 0.4);
    }
    to {
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.6);
    }
  }
  
  @keyframes breathe {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
  }
  
  .active-call-glow {
    animation: glow 2s ease-in-out infinite alternate;
  }
  
  .connecting-call {
    animation: breathe 1.5s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

interface LiveCall {
  id: number;
  status: 'connecting' | 'active' | 'completed';
  scamType: string;
  duration: number;
  startTime: Date;
  regionCode: string;
  personaUsed: string;
  personaAvatar: string;
  wastedTime: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface PersonaStatus {
  name: string;
  avatar: string;
  description: string;
  specialties: string[];
  successRate: string;
  isActive: boolean;
  currentCall: {
    scamType: string;
    duration: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  } | null;
  todaysCalls: number;
  averageCallDuration: number;
}

interface CallSummary {
  totalCalls: number;
  activeCalls: number;
  completedCalls: number;
  totalTimeWasted: number;
  topScamTypes: Array<{
    type: string;
    count: number;
  }>;
  recentCalls: LiveCall[];
  avgCallDuration: number;
  personaStatuses: PersonaStatus[];
}

export default function LiveCallDashboard() {
  const [animatedWastedTime, setAnimatedWastedTime] = useState(0);

  // Fetch live call data
  const { data: callData } = useQuery<CallSummary>({
    queryKey: ['/api/calls/live-summary'],
    refetchInterval: 3000, // Update every 3 seconds
  });

  // Animate wasted time counter
  useEffect(() => {
    if (callData?.totalTimeWasted) {
      const targetTime = callData.totalTimeWasted;
      const duration = 1500;
      const steps = 50;
      const increment = targetTime / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setAnimatedWastedTime(Math.min(increment * currentStep, targetTime));
        
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [callData?.totalTimeWasted]);

  const formatDuration = (totalSeconds: number) => {
    // Handle case where duration might be in milliseconds
    let seconds = totalSeconds;
    if (seconds > 86400) { // More than 24 hours suggests milliseconds
      seconds = Math.floor(seconds / 1000);
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connecting': return 'text-yellow-600 bg-yellow-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold">{callData?.totalCalls || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-green-600">{callData?.activeCalls || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Time Wasted</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatDuration(Math.round(animatedWastedTime))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatDuration(callData?.avgCallDuration || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Call Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>Live Call Activity</span>
            <Badge variant="outline" className="ml-auto animate-pulse">
              LIVE
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time feed of scammer calls being processed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {callData?.recentCalls?.map((call, index) => (
              <div 
                key={call.id}
                className={`p-4 rounded-lg border transition-all duration-500 hover:shadow-lg hover:scale-[1.02] transform
                           ${call.status === 'active' ? 'border-green-200 bg-green-50 active-call-glow' :
                             call.status === 'connecting' ? 'border-yellow-200 bg-yellow-50 connecting-call' :
                             'border-blue-200 bg-blue-50'}`}
                style={{ 
                  animationDelay: `${index * 150}ms`,
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{call.personaAvatar}</span>
                      <Badge className={getStatusColor(call.status)}>
                        {call.status.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium text-gray-700">
                        {call.scamType}
                      </span>
                      <Badge className={getRiskColor(call.riskLevel)} variant="outline">
                        {call.riskLevel.toUpperCase()} RISK
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Region: {call.regionCode}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Shield className="h-4 w-4" />
                        <span>Persona: {call.personaUsed}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {call.status === 'active' 
                            ? `${formatDuration(call.duration)} elapsed`
                            : `${formatDuration(call.wastedTime)} wasted`
                          }
                        </span>
                      </div>
                    </div>

                    {call.status === 'active' && (
                      <div className="mt-2">
                        <Progress 
                          value={(call.duration / 600) * 100} // Assuming 10 min max for visual
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Call in progress...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Waiting for scammer calls...</p>
                <p className="text-sm">The system will display live activity here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Persona Status Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>AI Persona Status Monitor</span>
          </CardTitle>
          <CardDescription>
            Real-time status of each AI persona including current calls and risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {callData?.personaStatuses?.map((persona, index) => (
              <div 
                key={persona.name}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  persona.isActive 
                    ? 'border-green-300 bg-green-50 shadow-md' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{persona.avatar}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{persona.name}</h3>
                      <p className="text-sm text-gray-600">{persona.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <Badge 
                      className={persona.isActive 
                        ? 'bg-green-100 text-green-700 border-green-300' 
                        : 'bg-gray-100 text-gray-600 border-gray-300'
                      }
                    >
                      {persona.isActive ? 'ON CALL' : 'STANDBY'}
                    </Badge>
                    
                    {persona.isActive && persona.currentCall && (
                      <Badge className={getRiskColor(persona.currentCall.riskLevel)} variant="outline">
                        {persona.currentCall.riskLevel.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Current Call Info */}
                {persona.isActive && persona.currentCall && (
                  <div className="mb-3 p-3 bg-white rounded border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Current Target: {persona.currentCall.scamType}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatDuration(persona.currentCall.duration)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((persona.currentCall.duration / 1800) * 100, 100)} 
                      className="h-2"
                    />
                  </div>
                )}

                {/* Persona Stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="font-semibold text-blue-600">{persona.successRate}%</p>
                    <p className="text-gray-500">Success Rate</p>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-600">{persona.todaysCalls}</p>
                    <p className="text-gray-500">Today's Calls</p>
                  </div>
                  <div>
                    <p className="font-semibold text-orange-600">{persona.averageCallDuration}m</p>
                    <p className="text-gray-500">Avg Duration</p>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Specialties:</p>
                  <div className="flex flex-wrap gap-1">
                    {persona.specialties.slice(0, 3).map((specialty, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                    {persona.specialties.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{persona.specialties.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )) || (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Loading persona status...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scam Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Top Scam Types Detected</CardTitle>
          <CardDescription>
            Most common scam types being targeted today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {callData?.topScamTypes?.map((scamType, index) => (
              <div key={scamType.type} className="flex items-center justify-between">
                <span className="font-medium">{scamType.type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${(scamType.count / (callData.topScamTypes[0]?.count || 1)) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-blue-600">{scamType.count}</span>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">
                Analyzing scam patterns...
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}