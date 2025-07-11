import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Shield, Eye, MapPin, Activity, TrendingUp } from "lucide-react";
import type { ScamRiskRegion } from "@shared/schema";

interface RegionTooltip {
  region: ScamRiskRegion;
  x: number;
  y: number;
}

export default function ScamRiskHeatMap() {
  const [selectedRegion, setSelectedRegion] = useState<ScamRiskRegion | null>(null);
  const [tooltip, setTooltip] = useState<RegionTooltip | null>(null);
  const [filterLevel, setFilterLevel] = useState<number>(0); // 0 = all, 1-10 = filter by risk level

  const { data: regions, isLoading } = useQuery<ScamRiskRegion[]>({
    queryKey: ["/api/scam-risk/regions"],
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Get risk level color
  const getRiskColor = (riskLevel: number): string => {
    if (riskLevel <= 2) return "#10B981"; // Green - Low risk
    if (riskLevel <= 4) return "#F59E0B"; // Yellow - Medium risk
    if (riskLevel <= 6) return "#F97316"; // Orange - High risk
    if (riskLevel <= 8) return "#EF4444"; // Red - Very high risk
    return "#DC2626"; // Dark red - Extreme risk
  };

  // Get risk level label
  const getRiskLabel = (riskLevel: number): string => {
    if (riskLevel <= 2) return "Low";
    if (riskLevel <= 4) return "Medium";
    if (riskLevel <= 6) return "High";
    if (riskLevel <= 8) return "Very High";
    return "Extreme";
  };

  // Filter regions based on selected risk level
  const filteredRegions = regions?.filter(region => 
    filterLevel === 0 || region.riskLevel >= filterLevel
  ) || [];

  // Calculate statistics
  const stats = regions ? {
    totalRegions: regions.length,
    highRiskRegions: regions.filter(r => r.riskLevel >= 7).length,
    activeThreats: regions.reduce((sum, r) => sum + r.activeCallsCount, 0),
    blockedScams: regions.reduce((sum, r) => sum + r.successfulBlocksCount, 0),
    averageRisk: Math.round(regions.reduce((sum, r) => sum + r.riskLevel, 0) / regions.length * 10) / 10
  } : null;

  return (
    <section id="risk-map" className="bg-gradient-to-br from-slate-50 to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-red-600 text-white mb-6 text-lg px-6 py-2">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Live Threat Intelligence
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">Scam Risk Heat Map</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time visualization of scam activity across regions. Monitor where Packie is actively 
            fighting scammers and protecting communities.
          </p>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {isLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : stats?.totalRegions || 0}
              </div>
              <div className="text-sm text-gray-600">Monitored Regions</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {isLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : stats?.highRiskRegions || 0}
              </div>
              <div className="text-sm text-gray-600">High Risk Areas</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {isLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : stats?.activeThreats || 0}
              </div>
              <div className="text-sm text-gray-600">Active Threats</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {isLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : stats?.blockedScams || 0}
              </div>
              <div className="text-sm text-gray-600">Scams Blocked</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {isLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : stats?.averageRisk || 0}
              </div>
              <div className="text-sm text-gray-600">Average Risk</div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Level Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button
            variant={filterLevel === 0 ? "default" : "outline"}
            onClick={() => setFilterLevel(0)}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            All Regions
          </Button>
          <Button
            variant={filterLevel === 7 ? "default" : "outline"}
            onClick={() => setFilterLevel(7)}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            High Risk Only
          </Button>
          <Button
            variant={filterLevel === 5 ? "default" : "outline"}
            onClick={() => setFilterLevel(5)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Medium+ Risk
          </Button>
          <Button
            variant={filterLevel === 3 ? "default" : "outline"}
            onClick={() => setFilterLevel(3)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Low+ Risk
          </Button>
        </div>

        {/* Map Container */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Visualization */}
          <Card className="lg:col-span-2 bg-white shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Interactive Risk Map
                <Badge className="ml-auto bg-green-500 text-white">
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Skeleton className="h-64 w-full mb-4" />
                    <div className="text-gray-500">Loading map data...</div>
                  </div>
                </div>
              ) : (
                <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Simplified US Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                    <div className="text-gray-400 text-lg font-medium">United States</div>
                  </div>
                  
                  {/* Risk Region Markers */}
                  {filteredRegions.map((region) => (
                    <div
                      key={region.id}
                      className="absolute w-6 h-6 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-lg hover:scale-125 transition-transform"
                      style={{
                        backgroundColor: getRiskColor(region.riskLevel),
                        left: `${Math.random() * 80 + 10}%`, // Simplified positioning
                        top: `${Math.random() * 60 + 20}%`,
                      }}
                      onClick={() => setSelectedRegion(region)}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          region,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              )}
              
              {/* Legend */}
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Low Risk (1-2)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Medium Risk (3-4)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-sm text-gray-600">High Risk (5-6)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Very High Risk (7-8)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-700 mr-2"></div>
                  <span className="text-sm text-gray-600">Extreme Risk (9-10)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Region Details Panel */}
          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Region Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {selectedRegion ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedRegion.region}
                    </h3>
                    <Badge 
                      className="text-white"
                      style={{ backgroundColor: getRiskColor(selectedRegion.riskLevel) }}
                    >
                      {getRiskLabel(selectedRegion.riskLevel)} Risk ({selectedRegion.riskLevel}/10)
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-gray-700">Scam Reports</span>
                      <span className="font-bold text-red-600">{selectedRegion.scamReportsCount}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-gray-700">Active Threats</span>
                      <span className="font-bold text-orange-600">{selectedRegion.activeCallsCount}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700">Blocked Scams</span>
                      <span className="font-bold text-green-600">{selectedRegion.successfulBlocksCount}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Common Scam Types</h4>
                    <div className="space-y-2">
                      {selectedRegion.commonScamTypes.slice(0, 5).map((scamType, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 capitalize">{scamType.type.replace('_', ' ')}</span>
                          <Badge variant="outline">{scamType.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(selectedRegion.lastUpdated).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Click on a region marker to view detailed information</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="font-semibold">{tooltip.region.region}</div>
            <div className="text-gray-300">
              Risk Level: {tooltip.region.riskLevel}/10 ({getRiskLabel(tooltip.region.riskLevel)})
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-xl border">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Help Packie Protect Your Community
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              See high scam activity in your area? Share our honeypot numbers to help Packie 
              intercept more scammer calls before they reach real victims.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Shield className="w-5 h-5 mr-2" />
                Report Scam Activity
              </Button>
              <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                <TrendingUp className="w-5 h-5 mr-2" />
                View Trends
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}