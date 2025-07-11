import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  ExternalLink, 
  Filter,
  Rss,
  RefreshCw,
  Clock,
  Shield
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface ScamTrend {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  imageUrl?: string;
  originalUrl: string;
}

interface ScamTrendsResponse {
  trends: ScamTrend[];
  totalCount: number;
  lastUpdated: string;
}

export default function ScamTrendsFeed() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');

  const { data: trendsData, isLoading, refetch } = useQuery<ScamTrendsResponse>({
    queryKey: ['/api/scam-trends', { 
      category: selectedCategory === 'all' ? undefined : selectedCategory || undefined,
      severity: selectedSeverity === 'all' ? undefined : selectedSeverity || undefined,
      limit: 10
    }],
    refetchInterval: 30 * 60 * 1000, // Refresh every 30 minutes
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceLogo = (source: string) => {
    switch (source) {
      case 'FTC': return '🏛️';
      case 'FBI': return '🔍';
      case 'AARP': return '👥';
      case 'BBB': return '🛡️';
      default: return '📢';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <span>Current Scam Trends</span>
                <Rss className="h-5 w-5 text-gray-400" />
              </CardTitle>
              <CardDescription>
                Live alerts from FTC, FBI, AARP, and Better Business Bureau
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/api/scam-trends/rss', '_blank')}
              >
                <Rss className="h-4 w-4 mr-2" />
                RSS Feed
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Consumer Protection">Consumer Protection</SelectItem>
                  <SelectItem value="Cybercrime">Cybercrime</SelectItem>
                  <SelectItem value="Senior Protection">Senior Protection</SelectItem>
                  <SelectItem value="Business Scams">Business Scams</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trends List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : trendsData?.trends && trendsData.trends.length > 0 ? (
              trendsData.trends.map((trend) => (
                <Card key={trend.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        {trend.imageUrl ? (
                          <img 
                            src={trend.imageUrl} 
                            alt={trend.title}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-2xl">{getSourceLogo(trend.source)}</div>
                        )}
                        <div className="flex-1">
                          <a 
                            href={trend.originalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 transition-colors"
                          >
                            <h3 className="font-semibold text-gray-900 mb-1 leading-tight hover:underline">
                              {trend.title}
                            </h3>
                          </a>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {trend.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={getSeverityColor(trend.severity)}>
                          {trend.severity.toUpperCase()}
                        </Badge>
                        
                        {trend.originalUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(trend.originalUrl, '_blank')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Original
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          {trend.source}
                        </span>
                        <span>{trend.category}</span>
                      </div>
                      
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(trend.pubDate)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No current trends</p>
                <p className="text-sm">
                  {selectedCategory || selectedSeverity 
                    ? 'No trends match your current filters. Try adjusting the criteria.'
                    : 'No scam trends are currently available from our sources.'
                  }
                </p>
                {(selectedCategory || selectedSeverity) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedSeverity('');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {trendsData?.lastUpdated && (
            <div className="mt-6 pt-4 border-t text-xs text-gray-500 text-center">
              Last updated: {format(new Date(trendsData.lastUpdated), 'MMM d, yyyy h:mm a')}
              <br />
              Data sourced from FTC, FBI, AARP, and Better Business Bureau
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}