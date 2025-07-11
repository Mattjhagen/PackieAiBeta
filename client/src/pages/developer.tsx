import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Download, 
  Youtube, 
  Calendar, 
  Clock, 
  Phone, 
  FileText, 
  LogOut,
  Eye,
  EyeOff,
  Code,
  BookOpen,
  Wand2,
  MessageSquare,
  Upload,
  Target,
  Users,
  AlertTriangle,
  Shield,
  Settings,
  UserPlus,
  Database,
  Search,
  Link,
  BarChart3,
  Send,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function Developer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', role: 'user' });
  const [clickbaitUrl, setClickbaitUrl] = useState('');
  const [apiTestUrl, setApiTestUrl] = useState('');
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', category: 'general' });
  const [newAnswer, setNewAnswer] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest('/api/developer/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      return response;
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({ title: "Login successful" });
    },
    onError: () => {
      toast({ title: "Invalid password", variant: "destructive" });
    }
  });

  // Clickbait analysis mutation
  const clickbaitAnalysisMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('/api/clickbait/analyze', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
      return response;
    },
    onSuccess: (data) => {
      toast({ 
        title: "Analysis Complete", 
        description: `Clickbait confidence: ${data.confidence}%` 
      });
    },
    onError: () => {
      toast({ title: "Analysis failed", variant: "destructive" });
    }
  });

  // API test mutation
  const apiTestMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('/api/test-endpoint', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
      return response;
    },
    onSuccess: (data) => {
      toast({ 
        title: "API Test Complete", 
        description: `Response time: ${data.responseTime}ms` 
      });
    },
    onError: () => {
      toast({ title: "API test failed", variant: "destructive" });
    }
  });

  // Submit question mutation
  const submitQuestionMutation = useMutation({
    mutationFn: async (questionData: { title: string; content: string; category: string }) => {
      const response = await apiRequest('/api/forum/questions', {
        method: 'POST',
        body: JSON.stringify(questionData),
      });
      return response;
    },
    onSuccess: () => {
      toast({ title: "Question submitted successfully" });
      setNewQuestion({ title: '', content: '', category: 'general' });
      queryClient.invalidateQueries({ queryKey: ['/api/forum/questions'] });
    },
    onError: () => {
      toast({ title: "Failed to submit question", variant: "destructive" });
    }
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async (answerData: { questionId: number; content: string }) => {
      const response = await apiRequest('/api/forum/answers', {
        method: 'POST',
        body: JSON.stringify(answerData),
      });
      return response;
    },
    onSuccess: () => {
      toast({ title: "Answer submitted successfully" });
      setNewAnswer('');
      setSelectedQuestionId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/forum/questions'] });
    },
    onError: () => {
      toast({ title: "Failed to submit answer", variant: "destructive" });
    }
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (userData: { email: string; role: string }) => {
      const response = await apiRequest('/api/developer/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    },
    onSuccess: () => {
      toast({ title: "User added successfully" });
      setNewUser({ email: '', role: 'user' });
      queryClient.invalidateQueries({ queryKey: ['/api/developer/users'] });
    },
    onError: () => {
      toast({ title: "Failed to add user", variant: "destructive" });
    }
  });

  // Data queries
  const { data: users } = useQuery({
    queryKey: ['/api/developer/users'],
    enabled: isAuthenticated,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/developer/stats'],
    enabled: isAuthenticated,
  });

  const { data: scamReports } = useQuery({
    queryKey: ['/api/scam-reports'],
    enabled: isAuthenticated,
  });

  const { data: forumQuestions } = useQuery({
    queryKey: ['/api/forum/questions'],
    enabled: isAuthenticated,
  });

  const { data: recordings } = useQuery({
    queryKey: ['/api/recordings'],
    enabled: isAuthenticated,
  });

  const { data: youtubeContent } = useQuery({
    queryKey: ['/api/youtube-content'],
    enabled: isAuthenticated,
  });

  const { data: robocallerStatus } = useQuery({
    queryKey: ['/api/robocaller/status'],
    enabled: isAuthenticated,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: sipStatus } = useQuery({
    queryKey: ['/api/sip/status'],
    enabled: isAuthenticated,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // SIP test mutations
  const testSIPMutation = useMutation({
    mutationFn: () => apiRequest('/api/sip/test-connection', { method: 'POST' }),
    onSuccess: (data) => {
      toast({
        title: data.success ? "SIP Connection Successful" : "SIP Connection Failed",
        description: data.success ? "SIP trunk is configured correctly" : "Check your SIP credentials",
        variant: data.success ? "default" : "destructive",
      });
    }
  });

  const createSIPTrunkMutation = useMutation({
    mutationFn: () => apiRequest('/api/sip/create-trunk', { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: "SIP Trunk Created",
        description: "SIP trunk has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sip/status'] });
    }
  });

  // File upload handler for FCC CSV data
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setUploadStatus('Error: Please select a CSV file');
      return;
    }

    setUploadStatus('Processing FCC data...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-fcc-csv', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        setUploadStatus(`Success: Added ${result.recordsProcessed} FCC scammer records to database`);
        queryClient.invalidateQueries({ queryKey: ['/api/robocaller/status'] });
        
        toast({
          title: "FCC Data Uploaded",
          description: `Successfully processed ${result.recordsProcessed} authentic scammer records from data.gov`,
        });
      } else {
        const error = await response.json();
        setUploadStatus(`Error: ${error.message}`);
      }
    } catch (error) {
      setUploadStatus('Error: Upload failed');
      console.error('Upload error:', error);
    }
  };

  // Start robocaller campaign
  const startRobocallerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/robocaller/start', {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      toast({ title: "Robocaller campaign started successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/robocaller/status'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to start robocaller", 
        description: error.message || "Campaign could not be started",
        variant: "destructive" 
      });
    }
  });

  // Stop robocaller campaign
  const stopRobocallerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/robocaller/stop', {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      toast({ title: "Robocaller campaign stopped" });
      queryClient.invalidateQueries({ queryKey: ['/api/robocaller/status'] });
    },
    onError: () => {
      toast({ title: "Failed to stop robocaller", variant: "destructive" });
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Developer Portal</CardTitle>
            <CardDescription>Enter password to access developer tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && loginMutation.mutate(password)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button 
              onClick={() => loginMutation.mutate(password)} 
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Authenticating..." : "Login"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile-friendly header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Developer Portal</h1>
                <p className="text-sm text-gray-600 hidden sm:block">PackieAI Administration</p>
              </div>
            </div>
            <Button onClick={() => setIsAuthenticated(false)} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Stats Overview - Mobile responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Users</p>
                  <p className="text-lg font-bold">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Calls</p>
                  <p className="text-lg font-bold">{stats?.totalCalls || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Reports</p>
                  <p className="text-lg font-bold">{scamReports?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Blocked</p>
                  <p className="text-lg font-bold">{stats?.totalDetections || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs - Mobile friendly */}
        <Tabs defaultValue="robocaller" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full lg:w-auto min-w-max">
              <TabsTrigger value="robocaller" className="text-sm">
                <Phone className="h-4 w-4 mr-2" />
                <span>Campaign</span>
              </TabsTrigger>
              <TabsTrigger value="recordings" className="text-sm">
                <Play className="h-4 w-4 mr-2" />
                <span>Recordings</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="text-sm">
                <Youtube className="h-4 w-4 mr-2" />
                <span>YouTube</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="text-sm">
                <Users className="h-4 w-4 mr-2" />
                <span>Users</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Scam Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Scam Reports</CardTitle>
                <CardDescription>Recent scammer reports from users</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {scamReports?.map((report: any) => (
                      <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-2 sm:space-y-0">
                        <div className="space-y-1">
                          <p className="font-medium">{report.phoneNumber}</p>
                          <p className="text-sm text-gray-600">{report.scamType}</p>
                          {report.description && (
                            <p className="text-sm text-gray-500 truncate max-w-md">{report.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={report.verified ? "default" : "secondary"}>
                            {report.verified ? "Verified" : "Pending"}
                          </Badge>
                          <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SIP Trunk Tab */}
          <TabsContent value="sip">
            <div className="grid gap-6">
              {/* SIP Configuration Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-6 w-6 text-green-600" />
                    <span>SIP Trunk Configuration</span>
                    <Badge variant={sipStatus?.configured ? "default" : "secondary"}>
                      {sipStatus?.configured ? "Configured" : "Not Configured"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Twilio SIP trunk for enhanced call routing and bulk operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Configuration Details */}
                  {sipStatus?.configured && sipStatus.configuration && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Configuration Details</h4>
                      <div className="space-y-1 text-sm text-green-700">
                        <p><strong>Domain:</strong> {sipStatus.configuration.domain}</p>
                        <p><strong>Username:</strong> {sipStatus.configuration.username}</p>
                        <p><strong>Account SID:</strong> {sipStatus.configuration.accountSid}</p>
                        {sipStatus.configuration.sipTrunkSid && (
                          <p><strong>Trunk SID:</strong> {sipStatus.configuration.sipTrunkSid}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Active Calls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Active SIP Calls</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {sipStatus?.activeCalls || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Total Calls Today</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {sipStatus?.calls?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* SIP Controls */}
                  <div className="flex space-x-4">
                    <Button 
                      onClick={() => testSIPMutation.mutate()}
                      disabled={testSIPMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {testSIPMutation.isPending ? "Testing..." : "Test SIP Connection"}
                    </Button>
                    
                    {!sipStatus?.configuration?.sipTrunkSid && (
                      <Button 
                        onClick={() => createSIPTrunkMutation.mutate()}
                        disabled={createSIPTrunkMutation.isPending}
                        variant="outline"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {createSIPTrunkMutation.isPending ? "Creating..." : "Create SIP Trunk"}
                      </Button>
                    )}
                  </div>

                  {/* SIP Benefits */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">SIP Trunk Benefits</h4>
                        <ul className="text-sm text-blue-700 mt-1 space-y-1">
                          <li>• Enhanced call quality and control</li>
                          <li>• Lower per-minute rates for bulk calling</li>
                          <li>• Advanced call routing capabilities</li>
                          <li>• Better integration with robocaller system</li>
                          <li>• Improved call recording and monitoring</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Robocaller Tab */}
          <TabsContent value="robocaller">
            <div className="grid gap-6">
              {/* Campaign Control */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-6 w-6 text-blue-600" />
                    <span>FTC Robocaller Campaign</span>
                    <Badge variant={robocallerStatus?.isActive ? "default" : "secondary"}>
                      {robocallerStatus?.isActive ? "Active" : "Stopped"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Start automated calling campaign to verified scammers from FTC database
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* CSV Upload Section */}
                  <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <Upload className="h-5 w-5 text-blue-600" />
                        <span>Upload FCC Scammer Database</span>
                      </CardTitle>
                      <CardDescription>
                        Upload authentic scammer data from data.gov FCC database (CSV format)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploadStatus && (
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Upload Status</AlertTitle>
                            <AlertDescription>{uploadStatus}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Overview */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Campaign Status</p>
                      <p className="text-lg font-bold text-gray-900">
                        {robocallerStatus?.isActive ? "Running" : "Stopped"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Queue Length</p>
                      <p className="text-lg font-bold text-gray-900">
                        {robocallerStatus?.queueLength || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Processed</p>
                      <p className="text-lg font-bold text-gray-900">
                        {robocallerStatus?.processedCount || 0}
                      </p>
                    </div>
                  </div>

                  {/* Campaign Controls */}
                  <div className="flex space-x-4">
                    <Button 
                      onClick={() => startRobocallerMutation.mutate()}
                      disabled={startRobocallerMutation.isPending || robocallerStatus?.isActive}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {startRobocallerMutation.isPending ? "Starting..." : "Start Campaign"}
                    </Button>
                    
                    <Button 
                      onClick={() => stopRobocallerMutation.mutate()}
                      disabled={stopRobocallerMutation.isPending || !robocallerStatus?.isActive}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {stopRobocallerMutation.isPending ? "Stopping..." : "Stop Campaign"}
                    </Button>
                  </div>

                  {/* Warning Notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">Campaign Guidelines</h4>
                        <ul className="text-sm text-amber-700 mt-1 space-y-1">
                          <li>• Only calls verified scammers from FTC database</li>
                          <li>• Respects business hours (9 AM - 8 PM local time)</li>
                          <li>• 45-second delay between calls to avoid detection</li>
                          <li>• All conversations are recorded for evidence</li>
                          <li>• Campaign stops automatically after queue completion</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* API Key Status */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">FTC Database Access</span>
                      <Badge variant="outline" className="text-blue-600">
                        Configured
                      </Badge>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* Recent Campaign Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Campaign Activity</CardTitle>
                  <CardDescription>Latest robocaller engagements and results</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {recordings?.filter((recording: any) => recording.source === 'robocaller')?.slice(0, 5).map((recording: any) => (
                        <div key={recording.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">Call #{recording.callId}</p>
                            <p className="text-sm text-gray-600">
                              Duration: {recording.duration ? `${Math.round(recording.duration / 60)}m` : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">{new Date(recording.createdAt).toLocaleString()}</p>
                          </div>
                          <Badge variant={recording.duration > 120 ? "default" : "secondary"}>
                            {recording.duration > 120 ? "Success" : "Brief"}
                          </Badge>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-center py-8">No recent robocaller activity</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Q&A Forum Tab */}
          <TabsContent value="forum">
            <div className="grid gap-6">
              {/* Ask Question Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Ask a Question</CardTitle>
                  <CardDescription>Get help from the community</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Question Title</Label>
                    <Input
                      id="title"
                      value={newQuestion.title}
                      onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                      placeholder="How do I integrate with Truecaller API?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newQuestion.category} onValueChange={(value) => setNewQuestion({...newQuestion, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="api">API Integration</SelectItem>
                        <SelectItem value="truecaller">Truecaller Partnership</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="content">Question Details</Label>
                    <Textarea
                      id="content"
                      value={newQuestion.content}
                      onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                      placeholder="Describe your question in detail..."
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={() => submitQuestionMutation.mutate(newQuestion)}
                    disabled={submitQuestionMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Question
                  </Button>
                </CardContent>
              </Card>

              {/* Questions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {forumQuestions?.map((question: any) => (
                        <div key={question.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-2 sm:space-y-0">
                            <div className="space-y-1">
                              <h3 className="font-medium">{question.title}</h3>
                              <Badge variant="outline">{question.category}</Badge>
                            </div>
                            <p className="text-xs text-gray-500">{new Date(question.createdAt).toLocaleDateString()}</p>
                          </div>
                          <p className="text-sm text-gray-600">{question.content}</p>
                          
                          {/* Answer Form */}
                          {selectedQuestionId === question.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                placeholder="Write your answer..."
                                rows={3}
                              />
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm"
                                  onClick={() => submitAnswerMutation.mutate({ questionId: question.id, content: newAnswer })}
                                  disabled={submitAnswerMutation.isPending}
                                >
                                  Submit Answer
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setSelectedQuestionId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedQuestionId(question.id)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Answer
                            </Button>
                          )}

                          {/* Answers */}
                          {question.answers?.map((answer: any) => (
                            <div key={answer.id} className="bg-gray-50 rounded p-3 ml-4">
                              <p className="text-sm">{answer.content}</p>
                              <p className="text-xs text-gray-500 mt-1">{new Date(answer.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analysis Tools Tab */}
          <TabsContent value="tools">
            <div className="grid gap-6">
              {/* Clickbait Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Clickbait Analysis</span>
                  </CardTitle>
                  <CardDescription>Analyze content for clickbait patterns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="clickbait-url">URL or Text to Analyze</Label>
                    <Input
                      id="clickbait-url"
                      value={clickbaitUrl}
                      onChange={(e) => setClickbaitUrl(e.target.value)}
                      placeholder="https://example.com/article or paste text here"
                    />
                  </div>
                  <Button 
                    onClick={() => clickbaitAnalysisMutation.mutate(clickbaitUrl)}
                    disabled={clickbaitAnalysisMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {clickbaitAnalysisMutation.isPending ? "Analyzing..." : "Analyze Content"}
                  </Button>
                  
                  {clickbaitAnalysisMutation.data && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        {clickbaitAnalysisMutation.data.isClickbait ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        <span className="font-medium">
                          {clickbaitAnalysisMutation.data.isClickbait ? "Clickbait Detected" : "Content Verified"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Confidence: {clickbaitAnalysisMutation.data.confidence}%
                      </p>
                      {clickbaitAnalysisMutation.data.reasons && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Reasons:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {clickbaitAnalysisMutation.data.reasons.map((reason: string, index: number) => (
                              <li key={index}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* API Testing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Link className="h-5 w-5" />
                    <span>API Testing</span>
                  </CardTitle>
                  <CardDescription>Test API endpoints and integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="api-url">API Endpoint URL</Label>
                    <Input
                      id="api-url"
                      value={apiTestUrl}
                      onChange={(e) => setApiTestUrl(e.target.value)}
                      placeholder="https://api.truecaller.com/v1/search"
                    />
                  </div>
                  <Button 
                    onClick={() => apiTestMutation.mutate(apiTestUrl)}
                    disabled={apiTestMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    {apiTestMutation.isPending ? "Testing..." : "Test Endpoint"}
                  </Button>
                  
                  {apiTestMutation.data && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">API Response</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Status: {apiTestMutation.data.status}
                      </p>
                      <p className="text-sm text-gray-600">
                        Response Time: {apiTestMutation.data.responseTime}ms
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recordings Tab */}
          <TabsContent value="recordings">
            <Card>
              <CardHeader>
                <CardTitle>Call Recordings</CardTitle>
                <CardDescription>Recent scammer call recordings and transcripts</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {recordings?.map((recording: any) => (
                      <div key={recording.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-2 sm:space-y-0">
                        <div className="space-y-1">
                          <p className="font-medium">Call #{recording.callId}</p>
                          <p className="text-sm text-gray-600">
                            Duration: {recording.duration ? `${Math.round(recording.duration / 60)}m` : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(recording.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Transcript
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* YouTube Content Tab */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>YouTube Content</CardTitle>
                <CardDescription>Generated content for social media</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {youtubeContent?.map((content: any) => (
                      <div key={content.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-2 sm:space-y-0">
                          <h3 className="font-medium">{content.title}</h3>
                          <Badge variant={content.status === 'published' ? 'default' : 'secondary'}>
                            {content.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{content.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {content.tags?.map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline">
                            <Youtube className="h-4 w-4 mr-2" />
                            Publish
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New User</CardTitle>
                  <CardDescription>Create new user accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    onClick={() => addUserMutation.mutate(newUser)}
                    disabled={addUserMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage existing users</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {users?.map((user: any) => (
                        <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded space-y-2 sm:space-y-0">
                          <div>
                            <p className="font-medium">{user.email}</p>
                            <Badge variant="outline" className="text-xs">{user.role}</Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}