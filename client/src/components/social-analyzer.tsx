import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SocialAnalyzer() {
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/social/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysis(result);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Shield className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Social Media TL;DR
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get instant summaries of clickbait articles and social media posts. Protect yourself from misinformation with AI-powered analysis.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Analyze Any URL</CardTitle>
            <CardDescription>
              Paste a social media post, article, or any URL to get an instant credibility analysis and TL;DR summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/suspicious-article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && analyzeUrl()}
                className="flex-1"
              />
              <Button 
                onClick={analyzeUrl} 
                disabled={isAnalyzing}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Analysis Results
                <Badge className={getRiskColor(analysis.riskLevel)}>
                  {getRiskIcon(analysis.riskLevel)}
                  {analysis.riskLevel || 'Unknown'} Risk
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* TL;DR Summary */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  TL;DR Summary
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-800">{analysis.summary}</p>
                </div>
              </div>

              {/* Key Points */}
              {analysis.keyPoints && analysis.keyPoints.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Key Points</h3>
                  <ul className="space-y-2">
                    {analysis.keyPoints.map((point: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warning Flags */}
              {analysis.warnings && analysis.warnings.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-red-600">Warning Flags</h3>
                  <div className="space-y-2">
                    {analysis.warnings.map((warning: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-red-700">{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Credibility Score */}
              {analysis.credibilityScore !== undefined && (
                <div>
                  <h3 className="font-semibold mb-2">Credibility Assessment</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          analysis.credibilityScore >= 70 ? 'bg-green-500' :
                          analysis.credibilityScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${analysis.credibilityScore}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-gray-700">
                      {analysis.credibilityScore}/100
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Scam Detection</h3>
              <p className="text-sm text-gray-600">
                AI-powered analysis identifies common scam tactics and suspicious content patterns
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <ExternalLink className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Instant Summaries</h3>
              <p className="text-sm text-gray-600">
                Get the key points from long articles without clicking through clickbait
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Fact Checking</h3>
              <p className="text-sm text-gray-600">
                Cross-reference claims with reliable sources and detect misinformation
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}