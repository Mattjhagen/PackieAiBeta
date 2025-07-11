import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ScamAlertContainer } from '@/components/ui/scam-alert';
import Navigation from '@/components/navigation';
import ScamRiskVisualization from '@/components/scam-risk-visualization';
import LiveCallDashboard from '@/components/live-call-dashboard';
import ForumScriptGenerator from '@/components/forum-script-generator';
import InteractiveScamEducation from '@/components/interactive-scam-education';
import DoNotCallRegistry from '@/components/do-not-call-registry';
import ScamPreventionChatbot from '@/components/scam-prevention-chatbot';
import { 
  Shield, 
  Phone, 
  Bot, 
  Clock, 
  Target, 
  Users, 
  AlertTriangle,
  PlayCircle,
  Code,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Headphones,
  MessageSquare,
  Search,
  ExternalLink,
  Heart,
  Coffee,
  Gift,
  Sparkles,
  Crown,
  Lightbulb,
  MessageCircle,
  TrendingUp
} from 'lucide-react';
import packieLogoPath from "@assets/ai_logo.png";

export default function Home() {
  const [reportPhone, setReportPhone] = useState('');
  const [scamType, setScamType] = useState('');
  const [description, setDescription] = useState('');
  const [clickbaitText, setClickbaitText] = useState('');
  const [easterEggClicks, setEasterEggClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const { toast } = useToast();

  // Easter egg handler
  const handleLogoClick = () => {
    setEasterEggClicks(prev => prev + 1);
    if (easterEggClicks === 6) {
      setShowEasterEgg(true);
      toast({
        title: "🎉 Easter Egg Found!",
        description: "You discovered Packie's secret! He loves belly rubs!",
      });
    } else if (easterEggClicks === 2) {
      toast({
        title: "Packie is happy!",
        description: "Keep clicking for a surprise...",
      });
    }
  };

  // Reset easter egg after 10 seconds
  useEffect(() => {
    if (showEasterEgg) {
      const timer = setTimeout(() => {
        setShowEasterEgg(false);
        setEasterEggClicks(0);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showEasterEgg]);

  const handleQuickReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportPhone.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number to report.",
        variant: "destructive",
      });
      return;
    }

    if (!scamType) {
      toast({
        title: "Scam type required",
        description: "Please select the type of scam.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/scam-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: reportPhone,
          scamType: scamType,
          description: description,
          source: 'user_report',
          reportedBy: 'public_user'
        }),
      });

      if (response.ok) {
        toast({
          title: "Report submitted successfully",
          description: `Report for ${reportPhone} has been sent to our monitoring team.`,
        });
        setReportPhone('');
        setScamType('');
        setDescription('');
      } else {
        toast({
          title: "Report failed",
          description: "Unable to submit report. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Report failed",
        description: "Unable to submit report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClickbaitCheck = async () => {
    if (!clickbaitText.trim()) {
      toast({
        title: "Text required",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/clickbait/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: clickbaitText }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: data.isClickbait ? "⚠️ Clickbait Detected" : "✅ Content Verified",
          description: `Confidence: ${data.confidence}%`,
        });
      } else {
        toast({
          title: "Analysis failed",
          description: "Unable to analyze content. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Unable to analyze content. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Scam Alert Notifications */}
      <ScamAlertContainer />
      
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div 
              className={`inline-block mb-8 cursor-pointer transition-transform duration-300 ${showEasterEgg ? 'animate-bounce' : 'hover:scale-110'}`}
              onClick={handleLogoClick}
            >
              <img 
                src={packieLogoPath} 
                alt="Packie AI" 
                className={`h-32 w-32 mx-auto rounded-full shadow-lg ${showEasterEgg ? 'ring-4 ring-pink-400 animate-pulse' : ''}`}
              />
              {showEasterEgg && (
                <div className="absolute -top-2 -right-2">
                  <Crown className="h-8 w-8 text-yellow-400 animate-spin" />
                </div>
              )}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Packie AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The world's smartest scam-fighting AI that turns the tables on phone scammers. 
              Packie keeps them busy so they can't bother real people!
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a 
                href="https://www.indiegogo.com/projects/packieai-scam-bot-that-waists-scammers-time" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button size="lg" className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white px-8 py-3">
                  <Gift className="h-5 w-5 mr-2" />
                  Support on Indiegogo
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
              
              <a 
                href="https://discord.gg/6GpTcQFc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button size="lg" variant="outline" className="px-8 py-3">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Join Discord
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </div>

            {/* Phone Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <Phone className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-800">Personal Line</p>
                  <p className="text-xl font-bold text-green-600">1-402-302-0633</p>
                  <p className="text-sm text-green-600">Personal scam protection</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-blue-800">Business Line</p>
                  <p className="text-xl font-bold text-blue-600">1-888-568-9418</p>
                  <p className="text-sm text-blue-600">Enterprise scam protection</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How Packie Protects You */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Packie Protects You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI technology meets clever conversation tactics to waste scammers' time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Bot className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>AI Voice Personas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Realistic human-sounding voices powered by ElevenLabs that sound completely natural to scammers.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Time Wasting Champions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our AI personas can keep scammers on the phone for hours, preventing them from targeting real victims.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Smart Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Advanced pattern recognition identifies scam calls and automatically deploys the perfect AI persona.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageCircle className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Conversation Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  AI learns from each interaction to become more effective at confusing and frustrating scammers.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Community Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Every minute Packie keeps a scammer busy is a minute they can't target vulnerable people.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track success metrics and see exactly how much time and money we're costing scammer operations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Real-Time Scam Risk Visualization */}
      <section id="live-dashboard" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Live Threat Intelligence Dashboard
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time monitoring and visualization of scam activity from authentic data sources
            </p>
          </div>
          
          <ScamRiskVisualization />
        </div>
      </section>

      {/* Live Call Dashboard */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Live Call Activity Dashboard
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time monitoring of active scammer calls and time being wasted
            </p>
          </div>
          
          <LiveCallDashboard />
        </div>
      </section>

      {/* Interactive Scam Education */}
      <section id="scam-trends" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How PackieAI Protects You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn about scam detection, AI personas, and real-time protection systems
            </p>
          </div>
          
          <InteractiveScamEducation />
        </div>
      </section>

      {/* Community Protection Tools */}
      <section id="tools" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Community Protection Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Protect yourself and help spread awareness with these anti-scam tools
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Do Not Call Registry */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Stop Unwanted Calls</h3>
              <p className="text-gray-600 mb-6">
                Register your phone number on the National Do Not Call Registry to reduce telemarketing calls
              </p>
              <DoNotCallRegistry />
            </div>
            
            {/* Forum Script Generator */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Spread Awareness</h3>
              <p className="text-gray-600 mb-6">
                Generate authentic posts to share PackieAI numbers on social media and forums
              </p>
              <ForumScriptGenerator />
            </div>
          </div>
        </div>
      </section>



      {/* Interactive Tools Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Try Our Tools
            </h2>
            <p className="text-xl text-gray-600">
              Test our scam detection and reporting capabilities
            </p>
          </div>

          <div className="grid gap-8">
            {/* Clickbait Detector */}
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-6 w-6 text-purple-600" />
                  <span>Clickbait Detector</span>
                  <Badge variant="secondary">AI Powered</Badge>
                </CardTitle>
                <CardDescription>
                  Test our AI's ability to detect clickbait and suspicious content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clickbait-text">Text or Headline to Analyze</Label>
                  <Textarea
                    id="clickbait-text"
                    value={clickbaitText}
                    onChange={(e) => setClickbaitText(e.target.value)}
                    placeholder="Doctors HATE this one simple trick! You won't believe what happens next..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleClickbaitCheck} className="w-full">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Analyze Content
                </Button>
              </CardContent>
            </Card>

            {/* Quick Scammer Report */}
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <span>Quick Scammer Report</span>
                </CardTitle>
                <CardDescription>
                  Help protect others by reporting scammer phone numbers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuickReport} className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Scammer Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={reportPhone}
                      onChange={(e) => setReportPhone(e.target.value)}
                      placeholder="e.g., (555) 123-4567"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="scam-type">Scam Type</Label>
                    <select 
                      id="scam-type"
                      value={scamType}
                      onChange={(e) => setScamType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select scam type...</option>
                      <option value="tech_support">Tech Support Scam</option>
                      <option value="irs_tax">IRS/Tax Scam</option>
                      <option value="bank_fraud">Bank/Credit Card Fraud</option>
                      <option value="medicare">Medicare/Health Insurance</option>
                      <option value="social_security">Social Security Scam</option>
                      <option value="romance">Romance Scam</option>
                      <option value="lottery">Lottery/Prize Scam</option>
                      <option value="charity">Fake Charity</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what happened during the scam call..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Submit Report
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Packie's Impact
            </h2>
            <p className="text-xl text-gray-600">
              Real results in the fight against phone scams
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">23</div>
              <p className="text-gray-600">Scammers Engaged</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">47</div>
              <p className="text-gray-600">Hours Wasted</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">89%</div>
              <p className="text-gray-600">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">$8.2K</div>
              <p className="text-gray-600">Scams Prevented</p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the Scam-Fighting Community
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Connect with fellow scam fighters, share experiences, and help make the internet safer for everyone
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://discord.gg/6GpTcQFc" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="secondary" className="px-8 py-3">
                <MessageSquare className="h-5 w-5 mr-2" />
                Discord Community
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </a>
            
            <a 
              href="https://www.indiegogo.com/projects/packieai-scam-bot-that-waists-scammers-time/x/10825589#/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="px-8 py-3 text-white border-white hover:bg-white hover:text-purple-600">
                <Heart className="h-5 w-5 mr-2" />
                Support Project
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src={packieLogoPath} alt="Packie AI" className="h-8 w-8 rounded" />
                <span className="font-bold text-xl">Packie AI</span>
              </div>
              <p className="text-gray-400">
                Fighting phone scams with advanced AI technology, one conversation at a time.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/developer" className="block text-gray-400 hover:text-white transition-colors">
                  Developer Portal
                </Link>
                <Link href="/guide" className="block text-gray-400 hover:text-white transition-colors">
                  Implementation Guide
                </Link>
                <Link href="/mobile" className="block text-gray-400 hover:text-white transition-colors">
                  Mobile App
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="space-y-2">
                <a 
                  href="https://discord.gg/6GpTcQFc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Discord Community
                </a>
                <a 
                  href="https://www.indiegogo.com/projects/packieai-scam-bot-that-waists-scammers-time/x/10825589#/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Indiegogo Campaign
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Packie AI. Made with <Coffee className="inline h-4 w-4 mx-1" /> and determination to fight scams.</p>
          </div>
        </div>
      </footer>
      
      {/* AI Scam Prevention Chatbot */}
      <ScamPreventionChatbot />
    </div>
  );
}