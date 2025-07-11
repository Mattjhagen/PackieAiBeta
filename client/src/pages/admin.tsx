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
  AlertTriangle
} from 'lucide-react';
import DeveloperForum from '@/components/developer-forum';

interface Recording {
  id: number;
  callSid: string;
  recordingUrl: string;
  recordingSid: string;
  callerNumber: string;
  status: string;
  duration: number | null;
  transcriptionText: string | null;
  createdAt: string;
  updatedAt: string;
}

interface YoutubeContent {
  id: number;
  title: string;
  description: string;
  script: string;
  scam_type: string;
  callId: number;
  tags: string[];
  highlights: string[];
  recordingUrl: string;
  status: string;
  createdAt: string;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<Array<{phone: string, name: string, scamType: string}>>([]);
  const [selectedPersona, setSelectedPersona] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      return response;
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      setPassword('');
      toast({
        title: "Success",
        description: "Admin access granted",
      });
    },
    onError: () => {
      toast({
        title: "Access Denied",
        description: "Invalid admin password",
        variant: "destructive",
      });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/admin/logout', { method: 'POST' });
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      setSelectedRecording(null);
      toast({
        title: "Logged Out",
        description: "Admin session ended",
      });
    }
  });

  // Fetch recordings
  const { data: recordings = [], isLoading: recordingsLoading } = useQuery({
    queryKey: ['/api/admin/recordings'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch YouTube content
  const { data: youtubeContent = [], isLoading: youtubeLoading } = useQuery({
    queryKey: ['/api/admin/youtube-content'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Generate YouTube content mutation
  const generateYoutubeMutation = useMutation({
    mutationFn: async (recordingId: number) => {
      return await apiRequest(`/api/admin/generate-youtube/${recordingId}`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/youtube-content'] });
      toast({
        title: "Success",
        description: "YouTube content generated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to generate content: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // CSV upload and cold call mutations
  const uploadCsvMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest('/api/admin/upload-scammers', {
        method: 'POST',
        body: formData
      });
    },
    onSuccess: (data) => {
      setCsvData(data.contacts);
      toast({
        title: "Success",
        description: `Uploaded ${data.contacts.length} contacts`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to upload CSV: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const initiateColdCallsMutation = useMutation({
    mutationFn: async (data: { contacts: Array<{phone: string, name: string, scamType: string}>, personaId: string }) => {
      return await apiRequest('/api/admin/initiate-cold-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Initiated ${data.callsStarted} cold calls`,
      });
      setCsvData([]);
      setCsvFile(null);
      setSelectedPersona('');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to initiate calls: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      loginMutation.mutate(password);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // CSV file handling
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const formData = new FormData();
      formData.append('csv', file);
      uploadCsvMutation.mutate(formData);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const handleInitiateColdCalls = () => {
    if (!selectedPersona || csvData.length === 0) {
      toast({
        title: "Error",
        description: "Please select a persona and upload contacts",
        variant: "destructive",
      });
      return;
    }
    
    initiateColdCallsMutation.mutate({
      contacts: csvData,
      personaId: selectedPersona
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
            <CardDescription>
              Enter admin password to access recordings and transcripts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
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
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Authenticating...' : 'Access Admin Panel'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">PackieAI Developer Portal</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Build, manage, and deploy anti-scam solutions</p>
        </div>
        <Button 
          onClick={() => logoutMutation.mutate()} 
          variant="outline"
          disabled={logoutMutation.isPending}
          className="w-full sm:w-auto"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="recordings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
          <TabsTrigger value="recordings" className="text-xs sm:text-sm">Recordings</TabsTrigger>
          <TabsTrigger value="youtube" className="text-xs sm:text-sm">YouTube</TabsTrigger>
          <TabsTrigger value="scripts" className="text-xs sm:text-sm">Scripts</TabsTrigger>
          <TabsTrigger value="coldcall" className="text-xs sm:text-sm">Cold Call</TabsTrigger>
          <TabsTrigger value="docs" className="text-xs sm:text-sm">Docs</TabsTrigger>
          <TabsTrigger value="forum" className="text-xs sm:text-sm">Forum</TabsTrigger>
        </TabsList>

        <TabsContent value="recordings" className="mt-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recordings Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Call Recordings ({recordings.length})
            </CardTitle>
            <CardDescription>
              View and manage recorded scammer calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recordingsLoading ? (
              <p className="text-center py-4">Loading recordings...</p>
            ) : recordings.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No recordings available</p>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {recordings.map((recording: Recording) => (
                    <div 
                      key={recording.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedRecording?.id === recording.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedRecording(recording)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{recording.callerNumber}</Badge>
                          <Badge variant={recording.transcriptionText ? "default" : "secondary"}>
                            {recording.transcriptionText ? "Transcribed" : "Processing"}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(recording.recordingUrl, '_blank');
                            }}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                          {recording.transcriptionText && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                generateYoutubeMutation.mutate(recording.id);
                              }}
                              disabled={generateYoutubeMutation.isPending}
                            >
                              <Youtube className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(recording.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(recording.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Transcript/YouTube Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedRecording ? <FileText className="w-5 h-5" /> : <Youtube className="w-5 h-5" />}
              {selectedRecording ? 'Call Transcript' : 'YouTube Content'}
            </CardTitle>
            <CardDescription>
              {selectedRecording 
                ? 'View transcript and generate YouTube content'
                : `Generated YouTube content (${youtubeContent.length})`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRecording ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => window.open(selectedRecording.recordingUrl, '_blank')}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Play Recording
                  </Button>
                  {selectedRecording.transcriptionText && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateYoutubeMutation.mutate(selectedRecording.id)}
                      disabled={generateYoutubeMutation.isPending}
                    >
                      <Youtube className="w-3 h-3 mr-1" />
                      Generate YouTube Content
                    </Button>
                  )}
                </div>
                
                <Separator />
                
                {selectedRecording.transcriptionText ? (
                  <ScrollArea className="h-80">
                    <div className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded">
                      {selectedRecording.transcriptionText}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Transcription is being processed...</p>
                    <p className="text-xs mt-2">This may take a few minutes after the call ends</p>
                  </div>
                )}
              </div>
            ) : (
              <ScrollArea className="h-96">
                {youtubeLoading ? (
                  <p className="text-center py-4">Loading YouTube content...</p>
                ) : youtubeContent.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Youtube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No YouTube content generated yet</p>
                    <p className="text-xs mt-2">Select a recording with transcription to generate content</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {youtubeContent.map((content: YoutubeContent) => (
                      <div key={content.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{content.title}</h3>
                          <Badge variant="outline">{content.scam_type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {content.description}
                        </p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>Created: {formatDate(content.createdAt)}</span>
                          <span>•</span>
                          <span>Call ID: {content.callId}</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(content.recordingUrl, '_blank')}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Audio
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(content.script);
                              toast({ title: "Copied", description: "Script copied to clipboard" });
                            }}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Copy Script
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="scripts" className="mt-6">
          <ScriptGenerator />
        </TabsContent>

        <TabsContent value="coldcall" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Proactive Cold Calling
                </CardTitle>
                <CardDescription>
                  Upload scammer contact lists and initiate proactive anti-scam calls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CSV Upload Section */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Scammer Contacts
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a CSV file with columns: phone, name, scamType
                  </p>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    {uploadCsvMutation.isPending && (
                      <p className="text-sm text-muted-foreground">Uploading and processing CSV...</p>
                    )}
                  </div>
                </div>

                {/* Uploaded Contacts Preview */}
                {csvData.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">Uploaded Contacts ({csvData.length})</h3>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {csvData.slice(0, 10).map((contact, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div>
                              <span className="font-medium">{contact.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">{contact.phone}</span>
                            </div>
                            <Badge variant="outline">{contact.scamType}</Badge>
                          </div>
                        ))}
                        {csvData.length > 10 && (
                          <p className="text-sm text-muted-foreground text-center">
                            And {csvData.length - 10} more contacts...
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Persona Selection */}
                {csvData.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">Select Persona for Cold Calls</h3>
                    <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a persona for the calls" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elderly-male">Elderly Male - Harold</SelectItem>
                        <SelectItem value="elderly-female">Elderly Female - Margaret</SelectItem>
                        <SelectItem value="middle-aged-male">Middle-aged Male - Robert</SelectItem>
                        <SelectItem value="young-adult">Young Adult - Sarah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Initiate Calls Button */}
                {csvData.length > 0 && selectedPersona && (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleInitiateColdCalls}
                      disabled={initiateColdCallsMutation.isPending}
                      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                    >
                      {initiateColdCallsMutation.isPending ? (
                        "Initiating Calls..."
                      ) : (
                        `Initiate ${csvData.length} Cold Calls`
                      )}
                    </Button>
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">CSV Format Requirements</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your CSV file should have these columns:
                  </p>
                  <code className="text-xs bg-background p-2 rounded block">
                    phone,name,scamType<br/>
                    +1234567890,John Scammer,tech-support<br/>
                    +0987654321,Jane Fraudster,irs-scam
                  </code>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Important Notes</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Only use verified scammer numbers from reliable sources</li>
                    <li>• Calls will be initiated automatically using selected persona</li>
                    <li>• All conversations will be recorded for analysis</li>
                    <li>• Monitor call progress in the Recordings tab</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="mt-6">
          <ImplementationGuide />
        </TabsContent>

        <TabsContent value="forum" className="mt-6">
          <DeveloperForum />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Script Generator Component
function ScriptGenerator() {
  const [platform, setPlatform] = useState('');
  const [scenario, setScenario] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateScript = async () => {
    if (!platform || !scenario) {
      toast({
        title: "Missing Information",
        description: "Please select both platform and scenario",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest('/api/generate-script', {
        method: 'POST',
        body: JSON.stringify({ platform, scenario })
      });
      setGeneratedScript(response.script);
      toast({
        title: "Script Generated",
        description: "Your customized script is ready"
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate script. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Script Generator
          </CardTitle>
          <CardDescription>
            Generate platform-specific scripts for anti-scam campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Target Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="reddit">Reddit</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="blog">Blog Post</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scenario">Scam Scenario</Label>
              <Select value={scenario} onValueChange={setScenario}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech-support">Tech Support Scam</SelectItem>
                  <SelectItem value="irs-tax">IRS/Tax Scam</SelectItem>
                  <SelectItem value="romance">Romance Scam</SelectItem>
                  <SelectItem value="investment">Investment Fraud</SelectItem>
                  <SelectItem value="charity">Fake Charity</SelectItem>
                  <SelectItem value="prize-lottery">Prize/Lottery Scam</SelectItem>
                  <SelectItem value="phishing">Phishing Attempt</SelectItem>
                  <SelectItem value="grandparent">Grandparent Scam</SelectItem>
                  <SelectItem value="employment">Employment Scam</SelectItem>
                  <SelectItem value="subscription">Subscription Trap</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateScript} 
            disabled={isGenerating || !platform || !scenario}
            className="w-full"
          >
            {isGenerating ? 'Generating Script...' : 'Generate Script'}
          </Button>

          {generatedScript && (
            <div className="space-y-2">
              <Label>Generated Script</Label>
              <Textarea
                value={generatedScript}
                readOnly
                className="min-h-[300px]"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedScript);
                    toast({ title: "Copied", description: "Script copied to clipboard" });
                  }}
                >
                  Copy Script
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([generatedScript], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${platform}-${scenario}-script.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Implementation Guide Component
function ImplementationGuide() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Implementation Guide
          </CardTitle>
          <CardDescription>
            Complete guide to implementing PackieAI anti-scam solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            
            {/* Quick Start */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Quick Start</h3>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">1. Phone Number Setup</h4>
                  <p className="text-sm text-muted-foreground mb-2">Configure your Twilio phone numbers for incoming scam calls:</p>
                  <code className="text-xs bg-background p-2 rounded block">
                    Primary: +1-XXX-XXX-XXXX (Main honeypot line)<br/>
                    Secondary: +1-XXX-XXX-XXXX (Backup/overflow)
                  </code>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">2. Webhook Configuration</h4>
                  <p className="text-sm text-muted-foreground mb-2">Set your Twilio webhook URL:</p>
                  <code className="text-xs bg-background p-2 rounded block">
                    https://your-domain.com/webhook/twilio
                  </code>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">3. Environment Variables</h4>
                  <p className="text-sm text-muted-foreground mb-2">Required API keys and configuration:</p>
                  <code className="text-xs bg-background p-2 rounded block">
                    TWILIO_ACCOUNT_SID=your_account_sid<br/>
                    TWILIO_AUTH_TOKEN=your_auth_token<br/>
                    TWILIO_PHONE_NUMBER=your_phone_number<br/>
                    ELEVENLABS_API_KEY=your_elevenlabs_key<br/>
                    OPENAI_API_KEY=your_openai_key
                  </code>
                </div>
              </div>
            </section>

            {/* API Integration */}
            <section>
              <h3 className="text-xl font-semibold mb-4">API Integration</h3>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Voice Personas API</h4>
                  <p className="text-sm text-muted-foreground mb-2">Manage AI personas for different scam scenarios:</p>
                  <code className="text-xs bg-background p-2 rounded block">
                    GET /api/personas - List all personas<br/>
                    POST /api/personas - Create new persona<br/>
                    PUT /api/personas/:id - Update persona<br/>
                    DELETE /api/personas/:id - Remove persona
                  </code>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Call Management API</h4>
                  <p className="text-sm text-muted-foreground mb-2">Monitor and control active calls:</p>
                  <code className="text-xs bg-background p-2 rounded block">
                    GET /api/calls - List active calls<br/>
                    GET /api/calls/:id - Get call details<br/>
                    POST /api/calls/:id/end - End active call<br/>
                    GET /api/recordings - List recordings
                  </code>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Analytics API</h4>
                  <p className="text-sm text-muted-foreground mb-2">Access call analytics and reports:</p>
                  <code className="text-xs bg-background p-2 rounded block">
                    GET /api/analytics/daily - Daily statistics<br/>
                    GET /api/analytics/heatmap - Risk heat map data<br/>
                    GET /api/analytics/trends - Scam trends analysis
                  </code>
                </div>
              </div>
            </section>

            {/* Persona Configuration */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Persona Configuration</h3>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Creating Effective Personas</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• Use realistic backgrounds and personalities</li>
                    <li>• Include specific quirks and speech patterns</li>
                    <li>• Define clear objectives for each persona</li>
                    <li>• Test personas with different scam types</li>
                    <li>• Regular updates based on call analytics</li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Voice Selection</h4>
                  <p className="text-sm text-muted-foreground mb-2">ElevenLabs voice mapping:</p>
                  <code className="text-xs bg-background p-2 rounded block">
                    "Elderly Male": "pNInz6obpgDQGcFmaJgB"<br/>
                    "Elderly Female": "XrExE9yKIg1WjnnlVkGX"<br/>
                    "Middle-aged Male": "onwK4e9ZLuTAKqWW03F9"<br/>
                    "Young Adult": "TxGEqnHWrfWFTfGW9XjX"
                  </code>
                </div>
              </div>
            </section>

            {/* Deployment */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Deployment</h3>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Production Checklist</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• ✓ All API keys configured and tested</li>
                    <li>• ✓ Webhook endpoints secured with HTTPS</li>
                    <li>• ✓ Database backups scheduled</li>
                    <li>• ✓ Monitoring and alerting enabled</li>
                    <li>• ✓ Legal compliance verified</li>
                    <li>• ✓ Call recording consent implemented</li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Scaling Considerations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• Load balancing for high call volumes</li>
                    <li>• Redis caching for persona responses</li>
                    <li>• CDN for audio file delivery</li>
                    <li>• Database read replicas for analytics</li>
                    <li>• Auto-scaling based on call metrics</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Best Practices */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Best Practices</h3>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Call Handling</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• Answer within 1-3 rings for returning callers</li>
                    <li>• Use 3-7 rings for new numbers to appear authentic</li>
                    <li>• Maintain persona consistency throughout calls</li>
                    <li>• Log all interactions for analysis</li>
                    <li>• Never reveal the anti-scam nature</li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Data Management</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• Regular cleanup of old recordings</li>
                    <li>• Anonymize personal information</li>
                    <li>• Encrypt sensitive call data</li>
                    <li>• Maintain audit logs</li>
                    <li>• Follow data retention policies</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}