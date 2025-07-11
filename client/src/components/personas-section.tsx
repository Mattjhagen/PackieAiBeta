import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Phone } from "lucide-react";
import type { Persona, Call } from "@shared/schema";

export default function PersonasSection() {
  const { data: personas, isLoading } = useQuery<Persona[]>({
    queryKey: ["/api/personas"],
  });

  const { data: activeCalls } = useQuery<Call[]>({
    queryKey: ["/api/calls/active"],
    refetchInterval: 2000, // Refresh every 2 seconds to show real-time status
  });

  const getPersonaGradient = (index: number) => {
    const gradients = [
      "from-blue-50 to-indigo-100 border-blue-200",
      "from-pink-50 to-rose-100 border-pink-200",
      "from-purple-50 to-violet-100 border-purple-200",
    ];
    return gradients[index % gradients.length];
  };

  const getPersonaColor = (index: number) => {
    const colors = ["text-indigo-600", "text-rose-600", "text-purple-600"];
    return colors[index % colors.length];
  };

  const isPersonaOnCall = (persona: Persona) => {
    return activeCalls?.some((call) => call.personaId === persona.id && call.status === 'active') || false;
  };

  return (
    <section id="personas" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Packie & The Team</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI trash pandas and investigative team are specially trained to keep scammers 
            busy with the most entertaining and time-wasting conversations you've ever heard.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-32 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {personas?.map((persona, index) => (
                <Card key={persona.id} className={`bg-gradient-to-br ${getPersonaGradient(index)} border-0 shadow-lg`}>
                  <CardContent className="p-8">
                    <div className="text-center mb-6 relative">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg bg-white flex items-center justify-center text-4xl">
                          <span className="select-none" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>
                            {persona.avatar || "👤"}
                          </span>
                        </div>
                        {/* Animated phone icon - only show when actually on call */}
                        {isPersonaOnCall(persona) && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            <Phone className="w-4 h-4 text-white animate-bounce" />
                          </div>
                        )}
                        {/* Call status indicator */}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                          {isPersonaOnCall(persona) ? (
                            <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-green-700 font-medium">On Call</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-blue-700 font-medium">Ready</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mt-4">{persona.name}</h3>
                      <p className={`font-medium ${getPersonaColor(index)}`}>{persona.description}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600 italic">
                          Engaging scammers with expert-level confusion and time-wasting techniques...
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">Specializes In:</div>
                          <ul className="text-gray-600 mt-1 space-y-1">
                            {persona.specialties.slice(0, 3).map((specialty, i) => (
                              <li key={i}>• {specialty}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Success Rate:</div>
                          <div className={`text-2xl font-bold ${getPersonaColor(index)} mt-1`}>
                            {persona.successRate}%
                          </div>
                          <div className="text-xs text-gray-500">
                            Avg. {persona.averageCallDuration} min/call
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* More Personas Coming */}
              <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 border-0 shadow-lg relative overflow-hidden">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-lg">
                      <Plus className="text-white w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">More Personas</h3>
                    <p className="text-purple-600 font-medium">Coming Soon</p>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600">
                        Help us expand our AI family! We're developing new personas like:
                      </p>
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        <li>• Businessman Bob (investment scams)</li>
                        <li>• Student Sam (student loan scams)</li>
                        <li>• Healthcare Helen (medical scams)</li>
                      </ul>
                    </div>
                    <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">
                      Vote for Next Persona
                    </Button>
                  </div>
                  <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-gray-900 transform rotate-12">
                    FUNDING GOAL
                  </Badge>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
