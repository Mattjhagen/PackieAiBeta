import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Link, MessageSquare, Sparkles, Copy, Check, Shield, AlertTriangle } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SocialAnalysis } from "@shared/schema";

export default function SocialAnalyzerSection() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("");
  const [content, setContent] = useState("");
  const [clickbaitText, setClickbaitText] = useState("");
  const [clickbaitUrl, setClickbaitUrl] = useState("");
  const [twitterTestText, setTwitterTestText] = useState("");
  const [twitterTestUrl, setTwitterTestUrl] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: analyses, isLoading: analysesLoading } = useQuery({
    queryKey: ['/api/social-analysis'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: twitterStatus, isLoading: twitterStatusLoading } = useQuery({
    queryKey: ['/api/twitter/status'],
    refetchInterval: 30000,
  });

  const twitterTestMutation = useMutation({
    mutationFn: async (data: { tweetText: string; articleUrl?: string }) => {
      return await apiRequest('/api/twitter/test-detection', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Test Complete",
        description: "Twitter clickbait detection test completed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to test detection",
        variant: "destructive",
      });
    },
  });

  const twitterControlMutation = useMutation({
    mutationFn: async (action: 'start' | 'stop') => {
      return await apiRequest(`/api/twitter/${action}-monitoring`, {
        method: 'POST',
        body: JSON.stringify({ adminKey }),
      });
    },
    onSuccess: (data: any, action: 'start' | 'stop') => {
      toast({
        title: action === 'start' ? "Monitoring Started" : "Monitoring Stopped",
        description: `Twitter monitoring has been ${action === 'start' ? 'started' : 'stopped'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/twitter/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Control Failed",
        description: error.message || "Failed to control monitoring",
        variant: "destructive",
      });
    },
  });

  const clickbaitMutation = useMutation({
    mutationFn: async (data: { postText: string; sourceUrl?: string }) => {
      return await apiRequest('/api/social/analyze-post', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Clickbait detection completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social-analysis'] });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze post",
        variant: "destructive",
      });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: { url: string; platform: string; content?: string }) => {
      const response = await fetch('/api/social-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-analysis'] });
      setUrl("");
      setContent("");
      setPlatform("");
      toast({
        title: "Analysis Complete!",
        description: "Packie has created a smart summary for your article.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the article",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !platform) {
      toast({
        title: "Missing Information",
        description: "Please provide both URL and platform",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/social-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          platform,
          content: content || "Test content for analysis - mega constellations like SpaceX's Starlink internet service and now we are learning just how the sun's activity can affect them"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      // Refresh the analyses list
      queryClient.invalidateQueries({ queryKey: ['/api/social-analysis'] });
      
      // Clear the form
      setUrl("");
      setContent("");
      setPlatform("");
      
      toast({
        title: "Analysis Complete!",
        description: "Packie has created a smart summary for your article.",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the article",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Copied!",
        description: "Summary copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return 'bg-blue-500';
      case 'twitter': case 'x': return 'bg-black';
      case 'reddit': return 'bg-orange-500';
      case 'linkedin': return 'bg-blue-700';
      default: return 'bg-gray-500';
    }
  };

  return (
    <section id="social-analyzer" className="bg-gradient-to-br from-purple-50 to-pink-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="inline-flex items-center bg-purple-100 text-purple-700 border-purple-200 mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Fundraising Feature Preview
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Packie's Smart Article Summarizer
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help Packie learn to fight misinformation! Submit clickbait articles from social media 
            and watch as our AI trash panda creates engaging, informative summaries that cut through the noise.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Analysis Tools */}
          <Card className="border-2 border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Packie's Analysis Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="article" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="article">Article Analyzer</TabsTrigger>
                  <TabsTrigger value="clickbait">Clickbait Detector</TabsTrigger>
                  <TabsTrigger value="twitter">X Monitor</TabsTrigger>
                </TabsList>
                
                <TabsContent value="article" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select social media platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="twitter">X (Twitter)</SelectItem>
                      <SelectItem value="reddit">Reddit</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Content (Optional)
                  </label>
                  <Textarea
                    placeholder="Paste the article text here for better analysis..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={analyzeMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Packie is analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Article
                    </>
                  )}
                </Button>
              </form>
                </TabsContent>
                
                <TabsContent value="clickbait" className="space-y-4">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!clickbaitText.trim()) {
                      toast({
                        title: "Missing Text",
                        description: "Please enter some text to analyze",
                        variant: "destructive",
                      });
                      return;
                    }
                    clickbaitMutation.mutate({
                      postText: clickbaitText,
                      sourceUrl: clickbaitUrl || undefined
                    });
                  }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Post Text
                      </label>
                      <Textarea
                        value={clickbaitText}
                        onChange={(e) => setClickbaitText(e.target.value)}
                        placeholder="Paste the social media post or headline to check for clickbait..."
                        className="min-h-[120px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Article URL (Optional)
                      </label>
                      <Input
                        type="url"
                        value={clickbaitUrl}
                        onChange={(e) => setClickbaitUrl(e.target.value)}
                        placeholder="https://example.com/article (if linked)"
                        className="w-full"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      disabled={clickbaitMutation.isPending}
                    >
                      {clickbaitMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Packie is checking...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Check for Clickbait
                        </>
                      )}
                    </Button>
                  </form>
                  
                  {clickbaitMutation.data && (
                    <Card className="mt-4 border-orange-200">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {clickbaitMutation.data.isClickbait ? (
                              <Badge variant="destructive" className="flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                CLICKBAIT DETECTED
                              </Badge>
                            ) : (
                              <Badge variant="default" className="flex items-center bg-green-100 text-green-800">
                                <Shield className="w-3 h-3 mr-1" />
                                LOOKS LEGITIMATE
                              </Badge>
                            )}
                            <span className="text-sm text-gray-600">
                              {clickbaitMutation.data.confidence}% confidence
                            </span>
                          </div>
                          
                          {clickbaitMutation.data.reasons?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Detection reasons:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {clickbaitMutation.data.reasons.map((reason: string, index: number) => (
                                  <li key={index} className="flex items-start">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {clickbaitMutation.data.suggestedResponse && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Packie's suggested response:</p>
                              <div className="bg-gray-50 p-3 rounded text-sm">
                                {clickbaitMutation.data.suggestedResponse}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  navigator.clipboard.writeText(clickbaitMutation.data.suggestedResponse);
                                  toast({
                                    title: "Copied!",
                                    description: "Response copied to clipboard",
                                  });
                                }}
                                className="mt-2"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy Response
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="twitter" className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">X (Twitter) Monitoring Status</h4>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-700">Always-on clickbait detection active</span>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Automatically scans X every 5 minutes for clickbait content and posts helpful summaries
                    </div>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!twitterTestText.trim()) {
                      toast({
                        title: "Missing Text",
                        description: "Please enter a tweet to test",
                        variant: "destructive",
                      });
                      return;
                    }
                    twitterTestMutation.mutate({
                      tweetText: twitterTestText,
                      articleUrl: twitterTestUrl || undefined
                    });
                  }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Tweet Text
                      </label>
                      <Textarea
                        value={twitterTestText}
                        onChange={(e) => setTwitterTestText(e.target.value)}
                        placeholder="You won't believe what happened next! This shocking discovery will change everything: https://example.com/article"
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Article URL (Optional)
                      </label>
                      <Input
                        type="url"
                        value={twitterTestUrl}
                        onChange={(e) => setTwitterTestUrl(e.target.value)}
                        placeholder="https://example.com/article"
                        className="w-full"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      disabled={twitterTestMutation.isPending}
                    >
                      {twitterTestMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testing detection...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Test X Detection
                        </>
                      )}
                    </Button>
                  </form>
                  
                  {twitterTestMutation.data && (
                    <Card className="mt-4 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {twitterTestMutation.data.isClickbait ? (
                              <Badge variant="destructive" className="flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                WOULD REPLY
                              </Badge>
                            ) : (
                              <Badge variant="default" className="flex items-center bg-green-100 text-green-800">
                                <Shield className="w-3 h-3 mr-1" />
                                WOULD IGNORE
                              </Badge>
                            )}
                            <span className="text-sm text-gray-600">
                              {twitterTestMutation.data.confidence}% confidence
                            </span>
                          </div>
                          
                          {twitterTestMutation.data.suggestedResponse && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Packie would reply:</p>
                              <div className="bg-blue-50 p-3 rounded text-sm">
                                {twitterTestMutation.data.suggestedResponse}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Analyses */}
          <Card className="border-2 border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Link className="w-5 h-5 mr-2" />
                Recent Analyses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 max-h-96 overflow-y-auto">
              {analysesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  <span className="ml-2 text-gray-500">Loading analyses...</span>
                </div>
              ) : analyses && analyses.length > 0 ? (
                <div className="space-y-4">
                  {(analyses as SocialAnalysis[]).map((analysis) => (
                    <div
                      key={analysis.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={`${getPlatformColor(analysis.platform)} text-white`}>
                          {analysis.platform}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(analysis.summary, analysis.id)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedId === analysis.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 break-all">
                        {new URL(analysis.url).hostname}
                      </p>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm font-medium text-gray-900">
                          {analysis.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No analyses yet. Submit your first article above!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🦝 Coming Soon: Automated Social Media Engagement
              </h3>
              <p className="text-gray-600 mb-4">
                This preview shows our upcoming feature where Packie will automatically detect 
                clickbait articles, analyze them, and post helpful summaries to combat misinformation 
                while promoting our scam-fighting mission!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://www.indiegogo.com/projects/packieai-scam-bot-that-waists-scammers-time/x/10825589#/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    💚 Back on Indiegogo
                  </Button>
                </a>
                <a 
                  href="https://discord.gg/6GpTcQFc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50">
                    💬 Join Our Discord
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}