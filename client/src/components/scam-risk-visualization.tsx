import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  Phone, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Clock,
  Activity,
  Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ScamRiskData {
  totalThreats: number;
  activeCalls: number;
  blockedCalls: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  trendDirection: 'up' | 'down' | 'stable';
  hotspots: Array<{
    region: string;
    threatCount: number;
    riskLevel: string;
  }>;
  recentActivity: Array<{
    timestamp: Date;
    type: string;
    description: string;
    severity: string;
  }>;
}

export default function ScamRiskVisualization() {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  // Fetch real-time scam risk data
  const { data: riskData } = useQuery<ScamRiskData>({
    queryKey: ['/api/scam-risk/realtime'],
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Animate the risk score
  useEffect(() => {
    if (riskData?.riskScore) {
      const targetScore = riskData.riskScore;
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = targetScore / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setAnimatedScore(Math.min(increment * currentStep, targetScore));
        
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [riskData?.riskScore]);

  // Pulse animation based on risk level
  useEffect(() => {
    if (riskData?.riskLevel) {
      const intensityMap = {
        low: 0.2,
        medium: 0.5,
        high: 0.8,
        critical: 1.0
      };
      setPulseIntensity(intensityMap[riskData.riskLevel]);
    }
  }, [riskData?.riskLevel]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Risk Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Gauge */}
        <Card className={`col-span-1 lg:col-span-2 ${getRiskColor(riskData?.riskLevel || 'low')}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield 
                className={`h-6 w-6 animate-pulse`} 
                style={{ 
                  animationDuration: `${2 - pulseIntensity}s`,
                  opacity: 0.7 + (pulseIntensity * 0.3)
                }}
              />
              <span>Real-Time Threat Level</span>
              <Badge variant="outline" className="ml-auto">
                {riskData?.riskLevel?.toUpperCase() || 'MONITORING'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Current scam activity and risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Animated Risk Score */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="opacity-20"
                  />
                  {/* Animated progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - animatedScore / 100)}`}
                    className="transition-all duration-500 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {Math.round(animatedScore)}
                  </span>
                </div>
              </div>
              <p className="text-sm mt-2 opacity-80">Risk Score (0-100)</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{riskData?.totalThreats || 0}</div>
                <div className="text-xs opacity-70">Total Threats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{riskData?.activeCalls || 0}</div>
                <div className="text-xs opacity-70">Active Calls</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{riskData?.blockedCalls || 0}</div>
                <div className="text-xs opacity-70">Blocked Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getTrendIcon(riskData?.trendDirection || 'stable')}
              <span>Trend Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Threat Intensity</span>
                <span className="text-sm font-bold">
                  {riskData?.riskLevel === 'critical' ? '+25%' : 
                   riskData?.riskLevel === 'high' ? '+15%' : 
                   riskData?.riskLevel === 'medium' ? '+5%' : '-10%'}
                </span>
              </div>
              <Progress 
                value={riskData?.riskScore || 0} 
                className="h-2 transition-all duration-1000"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Zap className="h-4 w-4" />
                <span>Auto-refresh: 5s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Hotspots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-red-500" />
            <span>Scam Hotspots</span>
          </CardTitle>
          <CardDescription>
            Regional threat activity and concentrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskData?.hotspots?.map((hotspot, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-2 ${getRiskColor(hotspot.riskLevel)} 
                           transform transition-all duration-500 hover:scale-105`}
                style={{ 
                  animationDelay: `${index * 200}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{hotspot.region}</span>
                  <Badge variant="outline" className="text-xs">
                    {hotspot.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {hotspot.threatCount}
                </div>
                <div className="text-xs opacity-70">Active Threats</div>
              </div>
            )) || (
              // Placeholder when no data
              <>
                {['North America', 'Europe', 'Asia Pacific'].map((region, index) => (
                  <div 
                    key={region}
                    className="p-4 rounded-lg border-2 bg-gray-50 border-gray-200 animate-pulse"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{region}</span>
                      <Badge variant="outline" className="text-xs">MONITORING</Badge>
                    </div>
                    <div className="text-2xl font-bold mt-2">--</div>
                    <div className="text-xs opacity-70">Loading...</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <span>Live Activity Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {riskData?.recentActivity?.map((activity, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border-l-4 transition-all duration-300
                           ${activity.severity === 'high' ? 'border-red-500 bg-red-50' :
                             activity.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                             'border-green-500 bg-green-50'}`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideInLeft 0.4s ease-out forwards'
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      activity.severity === 'high' ? 'border-red-300 text-red-700' :
                      activity.severity === 'medium' ? 'border-yellow-300 text-yellow-700' :
                      'border-green-300 text-green-700'
                    }`}
                  >
                    {activity.type}
                  </Badge>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Monitoring for scam activity...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
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