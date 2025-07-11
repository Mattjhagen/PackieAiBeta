import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, User, Shield, PlayCircle, Clock, CheckCircle } from 'lucide-react';

interface MobileReport {
  id: number;
  scammerNumber: string;
  scamType: string;
  description?: string;
  selectedPersona: string;
  status: 'pending' | 'calling' | 'completed';
  recordingUrl?: string;
  createdAt: string;
}

export default function Mobile() {
  const [scamNumber, setScamNumber] = useState('');
  const [scamType, setScamType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { toast } = useToast();

  // Load personas
  const { data: personas = [] } = useQuery({
    queryKey: ['/api/personas'],
  });

  // Load user reports
  const { data: reports = [] } = useQuery({
    queryKey: ['/api/mobile/reports'],
    enabled: !!user,
  });

  // Submit scam report
  const reportMutation = useMutation({
    mutationFn: async (data: {
      scammerNumber: string;
      scamType: string;
      description?: string;
      personaId: number;
    }) => {
      return await apiRequest('/api/mobile/report-scam', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Packie Deployed!",
        description: "Your revenge call is being prepared. You'll get a notification when it's ready.",
      });
      setScamNumber('');
      setScamType('');
      setDescription('');
      setSelectedPersona(null);
      queryClient.invalidateQueries({ queryKey: ['/api/mobile/reports'] });
    },
    onError: (error: any) => {
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to deploy Packie. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Authentication
  const authMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = authMode === 'login' ? '/api/mobile/login' : '/api/mobile/register';
      return await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      setUser(data.user);
      setShowAuth(false);
      toast({
        title: "Welcome to PackieAI!",
        description: `You're now ${authMode === 'login' ? 'logged in' : 'registered'}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Authentication Failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      });
    },
  });

  const handleReport = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    
    if (!scamNumber || !scamType || selectedPersona === null) {
      toast({
        title: "Missing Information",
        description: "Please fill in the scammer number, scam type, and select a persona.",
        variant: "destructive",
      });
      return;
    }

    reportMutation.mutate({
      scammerNumber: scamNumber,
      scamType,
      description,
      personaId: selectedPersona,
    });
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    authMutation.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'calling': return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Preparing Call';
      case 'calling': return 'Calling Scammer';
      case 'completed': return 'Call Complete';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🦝</span>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">PackieAI Mobile</h1>
                <p className="text-gray-200 text-sm">Scam Fighter</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => user ? setUser(null) : setShowAuth(true)}
              className="text-white"
            >
              {user ? <User className="w-5 h-5" /> : 'Login'}
            </Button>
          </div>
          
          {user && (
            <div className="mt-4 p-3 bg-green-500/20 rounded-xl">
              <p className="text-white text-sm">Welcome back, {user.name || user.email}!</p>
            </div>
          )}
        </div>

        {/* Report Form */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Report Scam Number
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="tel"
              placeholder="Enter scammer's phone number"
              value={scamNumber}
              onChange={(e) => setScamNumber(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-gray-300"
            />
            
            <select
              value={scamType}
              onChange={(e) => setScamType(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Select scam type</option>
              <option value="irs">IRS/Tax Scam</option>
              <option value="warranty">Car Warranty</option>
              <option value="medicare">Medicare/Health</option>
              <option value="tech_support">Tech Support</option>
              <option value="romance">Romance Scam</option>
              <option value="investment">Investment/Crypto</option>
              <option value="other">Other</option>
            </select>
            
            <Textarea
              placeholder="Describe what happened (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-gray-300"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Persona Selection */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Choose Your Revenge Persona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {personas.map((persona: any) => (
                <div
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPersona === persona.id
                      ? 'border-amber-400 bg-amber-400/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{persona.name}</h3>
                      <p className="text-gray-300 text-sm mt-1">{persona.description}</p>
                    </div>
                    <div className="text-2xl">{persona.emoji || '🎭'}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deploy Button */}
        <Button
          onClick={handleReport}
          disabled={reportMutation.isPending || !scamNumber || !scamType || selectedPersona === null}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 text-lg rounded-2xl"
        >
          {reportMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Deploying Packie...
            </>
          ) : (
            <>
              🚀 Deploy Packie!
            </>
          )}
        </Button>

        {/* Recent Reports */}
        {user && reports.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Your Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.slice(0, 5).map((report: MobileReport) => (
                  <div key={report.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{report.scammerNumber}</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(report.status)}
                        <span className="text-gray-300 text-sm">{getStatusText(report.status)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                        {report.scamType}
                      </Badge>
                      {report.recordingUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(report.recordingUrl, '_blank')}
                          className="text-white border-white/20"
                        >
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Play
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auth Modal */}
        {showAuth && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-sm bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-center">Join PackieAI</CardTitle>
                <div className="flex">
                  <Button
                    variant={authMode === 'login' ? 'default' : 'ghost'}
                    onClick={() => setAuthMode('login')}
                    className="flex-1"
                  >
                    Login
                  </Button>
                  <Button
                    variant={authMode === 'register' ? 'default' : 'ghost'}
                    onClick={() => setAuthMode('register')}
                    className="flex-1"
                  >
                    Register
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder-gray-300"
                  />
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder-gray-300"
                  />
                  {authMode === 'register' && (
                    <>
                      <Input
                        name="name"
                        placeholder="Full Name"
                        className="bg-white/10 border-white/20 text-white placeholder-gray-300"
                      />
                      <Input
                        name="phone"
                        type="tel"
                        placeholder="Phone Number (for notifications)"
                        className="bg-white/10 border-white/20 text-white placeholder-gray-300"
                      />
                    </>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={authMutation.isPending}
                      className="flex-1 bg-amber-500 hover:bg-amber-600"
                    >
                      {authMutation.isPending ? 'Processing...' : authMode === 'login' ? 'Login' : 'Register'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAuth(false)}
                      className="border-white/20 text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}