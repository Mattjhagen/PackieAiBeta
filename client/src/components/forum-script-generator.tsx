import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, Sparkles, MessageSquare, Phone, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ScriptRequest {
  phoneNumber: string;
  platform: string;
  persona: string;
  customContext?: string;
}

interface GeneratedScript {
  title: string;
  content: string;
  hashtags: string[];
  callToAction: string;
  platform: string;
}

export default function ForumScriptGenerator() {
  const [selectedNumber, setSelectedNumber] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const { toast } = useToast();

  const phoneNumbers = [
    { value: '1-402-302-0633', label: 'Personal Line (402)', type: 'personal' },
    { value: '1-888-568-9418', label: 'Business Line (888)', type: 'business' }
  ];

  const platforms = [
    { value: 'reddit', label: 'Reddit', icon: '🔴' },
    { value: 'facebook', label: 'Facebook', icon: '📘' },
    { value: 'twitter', label: 'X (Twitter)', icon: '🐦' },
    { value: 'craigslist', label: 'Craigslist', icon: '📝' },
    { value: 'nextdoor', label: 'Nextdoor', icon: '🏡' },
    { value: 'forums', label: 'General Forums', icon: '💬' }
  ];

  const personas = [
    { value: 'elderly', label: 'Elderly Person', description: 'Concerned about scams targeting seniors' },
    { value: 'parent', label: 'Worried Parent', description: 'Protecting family from scammers' },
    { value: 'professional', label: 'Business Professional', description: 'Corporate scam prevention' },
    { value: 'tech-savvy', label: 'Tech-Savvy User', description: 'Fighting scams with technology' },
    { value: 'victim', label: 'Scam Victim', description: 'Sharing experience to help others' },
    { value: 'advocate', label: 'Community Advocate', description: 'Promoting community safety' }
  ];

  const generateScript = useMutation({
    mutationFn: async (request: ScriptRequest): Promise<GeneratedScript> => {
      const response = await apiRequest('/api/generate-forum-script', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return response as GeneratedScript;
    },
    onSuccess: (data) => {
      setGeneratedScript(data);
      toast({
        title: "Script Generated",
        description: "Your posting script has been created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate script. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!selectedNumber || !selectedPlatform || !selectedPersona) {
      toast({
        title: "Missing Information",
        description: "Please select a phone number, platform, and persona.",
        variant: "destructive",
      });
      return;
    }

    generateScript.mutate({
      phoneNumber: selectedNumber,
      platform: selectedPlatform,
      persona: selectedPersona,
      customContext: customContext || undefined,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Script copied to clipboard.",
    });
  };

  const getNumberType = (number: string) => {
    return number.includes('402') ? 'personal' : 'business';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <span>Forum Script Generator</span>
          </CardTitle>
          <CardDescription>
            Generate authentic posting scripts to share PackieAI numbers on social media and forums
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phone Number Selection */}
          <div className="space-y-2">
            <Label>Select Phone Number</Label>
            <Select value={selectedNumber} onValueChange={setSelectedNumber}>
              <SelectTrigger>
                <SelectValue placeholder="Choose which number to promote" />
              </SelectTrigger>
              <SelectContent>
                {phoneNumbers.map((phone) => (
                  <SelectItem key={phone.value} value={phone.value}>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{phone.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {phone.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Platform Selection */}
          <div className="space-y-2">
            <Label>Target Platform</Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Choose where to post" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    <div className="flex items-center space-x-2">
                      <span>{platform.icon}</span>
                      <span>{platform.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Persona Selection */}
          <div className="space-y-2">
            <Label>Posting Persona</Label>
            <Select value={selectedPersona} onValueChange={setSelectedPersona}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your persona" />
              </SelectTrigger>
              <SelectContent>
                {personas.map((persona) => (
                  <SelectItem key={persona.value} value={persona.value}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{persona.label}</span>
                      <span className="text-xs text-gray-500">{persona.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Context */}
          <div className="space-y-2">
            <Label>Additional Context (Optional)</Label>
            <Textarea
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder="Add any specific details about your situation or community..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={generateScript.isPending || !selectedNumber || !selectedPlatform || !selectedPersona}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {generateScript.isPending ? 'Generating...' : 'Generate Script'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Script Display */}
      {generatedScript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Script</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{generatedScript.platform}</Badge>
                <Badge 
                  className={getNumberType(selectedNumber) === 'personal' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                >
                  {getNumberType(selectedNumber) === 'personal' ? 'Personal' : 'Business'}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Title/Subject</Label>
              <div className="relative">
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="font-medium">{generatedScript.title}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generatedScript.title)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Post Content</Label>
              <div className="relative">
                <div className="p-4 bg-gray-50 rounded-lg border min-h-32">
                  <p className="whitespace-pre-wrap">{generatedScript.content}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generatedScript.content)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Hashtags */}
            {generatedScript.hashtags && generatedScript.hashtags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Hashtags</Label>
                <div className="flex flex-wrap gap-2">
                  {generatedScript.hashtags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer"
                           onClick={() => copyToClipboard(tag)}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Call to Action</Label>
              <div className="relative">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">{generatedScript.callToAction}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generatedScript.callToAction)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Copy Full Script */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const fullScript = `${generatedScript.title}\n\n${generatedScript.content}\n\n${generatedScript.callToAction}${generatedScript.hashtags?.length ? '\n\n' + generatedScript.hashtags.join(' ') : ''}`;
                copyToClipboard(fullScript);
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Complete Script
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}