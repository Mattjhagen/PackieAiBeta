import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";
import { UserRoundCheck, User, Circle, Play, Pause, Volume2 } from "lucide-react";
import type { Call, Analytics, Persona, CallRecording } from "@shared/schema";
import { useState, useRef } from "react";
import { anonymizePhoneNumber } from "@/lib/privacy";

export default function DashboardSection() {
  const { data: activeCalls, isLoading: callsLoading } = useQuery<Call[]>({
    queryKey: ["/api/calls/active"],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const { data: personas } = useQuery<Persona[]>({
    queryKey: ["/api/personas"],
  });

  // Use WebSocket for real-time updates
  useWebSocket();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPersonaIcon = (personaName: string) => {
    if (personaName.includes("Timmy")) return UserRoundCheck;
    if (personaName.includes("Daisy")) return User;
    return UserRoundCheck;
  };

  const getPersonaColor = (personaName: string) => {
    if (personaName.includes("Timmy")) return "bg-blue-100 text-blue-600";
    if (personaName.includes("Daisy")) return "bg-pink-100 text-pink-600";
    return "bg-blue-100 text-blue-600";
  };

  return (
    <section id="dashboard" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">PackieAI Live Monitoring Dashboard</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track scammer activity in real-time, analyze patterns, and see the impact of our AI defense system.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <Card className="border-0 shadow-xl overflow-hidden">
          {/* Dashboard Header */}
          <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">PackieAI Command Center v2.0</h3>
                <p className="text-gray-300">Taking out the trash - Real-time scammer tracking</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Circle className="w-3 h-3 text-green-500 fill-current animate-pulse" />
                  <span className="text-sm">Live</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {callsLoading ? <Skeleton className="h-8 w-12" /> : activeCalls?.length || 0}
                  </div>
                  <div className="text-xs text-gray-300">Active Calls</div>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Dashboard Content */}
          <CardContent className="p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Active Calls */}
              <div className="lg:col-span-2">
                <h4 className="text-lg font-semibold mb-4">Active Scam Calls</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {callsLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <Skeleton className="w-8 h-8 rounded-full" />
                              <div>
                                <Skeleton className="h-4 w-32 mb-1" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </div>
                            <Skeleton className="h-6 w-16" />
                          </div>
                          <Skeleton className="h-16 w-full" />
                        </CardContent>
                      </Card>
                    ))
                  ) : activeCalls && activeCalls.length > 0 ? (
                    activeCalls.map((call) => {
                      const persona = personas?.find(p => p.id === call.personaId);
                      const PersonaIcon = getPersonaIcon(persona?.name || "");
                      
                      return (
                        <Card key={call.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPersonaColor(persona?.name || "")}`}>
                                  <PersonaIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-medium">{persona?.name || "AI Persona"}</div>
                                  <div className="text-sm text-gray-500">vs {anonymizePhoneNumber(call.scammerNumber)}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600">
                                  {formatDuration(call.duration)}
                                </div>
                                <div className="text-xs text-gray-500">Duration</div>
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded p-3 text-sm">
                              <div className="text-gray-600 mb-1">Latest AI Response:</div>
                              <div className="font-mono text-xs truncate">
                                "{call.lastResponse || "Engaging scammer with time-wasting tactics..."}"
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <Card className="border border-gray-200">
                      <CardContent className="p-8 text-center">
                        <p className="text-gray-500">No active calls at the moment</p>
                        <p className="text-sm text-gray-400 mt-2">Waiting for scammers to call...</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                {/* Today's Stats */}
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Today's Impact</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-2xl font-bold">
                          {analyticsLoading ? <Skeleton className="h-8 w-16" /> : analytics?.scammersWasted || 0}
                        </div>
                        <div className="text-sm text-emerald-100">Scammers Wasted</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {analyticsLoading ? <Skeleton className="h-8 w-16" /> : analytics?.totalDuration || 0}
                        </div>
                        <div className="text-sm text-emerald-100">Hours Wasted</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {analyticsLoading ? (
                            <Skeleton className="h-8 w-20" />
                          ) : analytics?.scamsPrevented ? (
                            `$${Math.round(parseFloat(analytics.scamsPrevented) / 1000)}K`
                          ) : (
                            "$0"
                          )}
                        </div>
                        <div className="text-sm text-emerald-100">Scams Prevented</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Scam Types */}
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Top Scam Types Today</h4>
                    <div className="space-y-3">
                      {analyticsLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                          <div key={index}>
                            <div className="flex justify-between items-center mb-1">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-8" />
                            </div>
                            <Skeleton className="h-2 w-full" />
                          </div>
                        ))
                      ) : analytics?.topScamTypes ? (
                        analytics.topScamTypes.map((scamType, index) => (
                          <div key={index}>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">{scamType.type}</span>
                              <span className="text-sm font-medium text-primary">{scamType.percentage}%</span>
                            </div>
                            <Progress value={scamType.percentage} className="h-2 mt-1" />
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">System Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">AI Response Time</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">0.3s</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Call Quality</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">98.7%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Server Uptime</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">99.9%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
