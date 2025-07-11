import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Settings, 
  ExternalLink, 
  CheckCircle,
  AlertCircle,
  Copy,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function DiscordConfig() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const { toast } = useToast();

  const { data: connectionStatus, refetch } = useQuery({
    queryKey: ['/api/discord/test'],
    retry: false,
  });

  const configureWebhook = useMutation({
    mutationFn: async (url: string) => {
      return apiRequest('/api/discord/webhook-url', {
        method: 'POST',
        body: JSON.stringify({ webhookUrl: url }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Discord webhook configured successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Configuration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendTestAlert = useMutation({
    mutationFn: async (alertData: any) => {
      return apiRequest('/api/discord/send-alert', {
        method: 'POST',
        body: JSON.stringify(alertData),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Test message sent",
        description: "Check your Discord channel for the test message",
      });
    },
    onError: (error) => {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "URL copied to clipboard",
    });
  };

  const handleWebhookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (webhookUrl.trim()) {
      configureWebhook.mutate(webhookUrl.trim());
    }
  };

  const handleTestMessage = () => {
    const alertData = {
      type: 'system_update',
      data: {
        title: 'Discord Integration Test',
        description: testMessage || 'Testing Discord webhook connection from PackieAI',
        type: 'info',
        details: ['This is a test message to verify Discord integration is working properly.'],
      }
    };
    sendTestAlert.mutate(alertData);
  };

  const sendScamCallTest = () => {
    const alertData = {
      type: 'scam_call',
      data: {
        scammerNumber: '+1-555-SCAMMER',
        scamType: 'Tech Support Scam',
        duration: 425, // 7+ minutes
        personaName: 'Grandma Betty',
        confidence: 'High (95%)',
      }
    };
    sendTestAlert.mutate(alertData);
  };

  const sendFraudAlertTest = () => {
    const alertData = {
      type: 'fraud_alert',
      data: {
        title: 'New IRS Impersonation Scam Detected',
        description: 'Scammers are calling claiming to be from the IRS demanding immediate payment via gift cards.',
        severity: 'high' as const,
        source: 'FCC Consumer Alerts',
        originalUrl: 'https://www.fcc.gov/consumer-alerts',
      }
    };
    sendTestAlert.mutate(alertData);
  };

  const currentDomain = window.location.origin;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discord Integration Setup
          </CardTitle>
          <CardDescription>
            Configure Discord notifications for scam alerts and system updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            {connectionStatus?.success ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>

          {/* Webhook Configuration */}
          <form onSubmit={handleWebhookSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Discord Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://discord.com/api/webhooks/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Create a webhook in your Discord server settings → Integrations → Webhooks
              </p>
            </div>
            <Button 
              type="submit" 
              disabled={!webhookUrl.trim() || configureWebhook.isPending}
              className="w-full"
            >
              {configureWebhook.isPending ? 'Configuring...' : 'Configure Webhook'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Discord Application URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Discord Application Configuration
          </CardTitle>
          <CardDescription>
            Use these URLs when setting up your Discord application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Interactions Endpoint URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={`${currentDomain}/api/discord/interactions`}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${currentDomain}/api/discord/interactions`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Linked Roles Verification URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={`${currentDomain}/api/discord/linked-roles-verify`}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${currentDomain}/api/discord/linked-roles-verify`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Terms of Service URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={`${currentDomain}/terms-of-service`}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${currentDomain}/terms-of-service`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`${currentDomain}/terms-of-service`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Privacy Policy URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={`${currentDomain}/privacy-policy`}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${currentDomain}/privacy-policy`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`${currentDomain}/privacy-policy`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Test Discord Notifications</CardTitle>
          <CardDescription>
            Send test messages to verify your Discord integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-message">Custom Test Message</Label>
            <Textarea
              id="test-message"
              placeholder="Enter a custom test message..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={handleTestMessage}
              disabled={sendTestAlert.isPending}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Custom Message
            </Button>
            
            <Button
              variant="outline"
              onClick={sendScamCallTest}
              disabled={sendTestAlert.isPending}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Scam Call Alert
            </Button>
            
            <Button
              variant="outline"
              onClick={sendFraudAlertTest}
              disabled={sendTestAlert.isPending}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Fraud Alert
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}