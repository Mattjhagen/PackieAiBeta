import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Phone, Code, Settings, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImplementationGuide() {
  const { toast } = useToast();
  const [activeScript, setActiveScript] = useState("twilio");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const twilioScript = `// Twilio Integration Script
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Forward scam calls to PackieAI honeypot
app.post('/webhook/incoming-call', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  
  // Check if caller is suspicious
  const callerNumber = req.body.From;
  if (isSuspiciousCall(callerNumber)) {
    // Forward to PackieAI honeypot
    twiml.dial('+14025551234'); // Consumer honeypot
  } else {
    // Handle normal call
    twiml.say('Please hold while we connect you.');
  }
  
  res.type('text/xml');
  res.send(twiml.toString());
});`;

  const asteriskScript = `; Asterisk Configuration
[incoming]
exten => _X.,1,Answer()
exten => _X.,n,Set(CALLER_ID=$` + `{CALLERID(num)})
exten => _X.,n,AGI(scam-detection.php,$` + `{CALLER_ID})
exten => _X.,n,GotoIf([$` + `{SCAM_SCORE} > 70]?honeypot:normal)
exten => _X.,n(honeypot),Dial(SIP/14025551234@packie-ai)
exten => _X.,n(normal),Dial(SIP/your-real-number)
exten => _X.,n,Hangup()`;

  const apiIntegration = `// API Integration Example
const PackieAI = {
  baseURL: 'https://your-repl.replit.app',
  
  async reportScamCall(phoneNumber, scamType, details) {
    const response = await fetch(\`\${this.baseURL}/api/scam-reports\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        scamType,
        description: details,
        source: 'api'
      })
    });
    return response.json();
  },
  
  async getPersonaResponse(personaId, userInput) {
    const response = await fetch(\`\${this.baseURL}/api/personas/\${personaId}/respond\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: userInput })
    });
    return response.json();
  }
};`;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Implementation Guide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete walkthrough to integrate PackieAI honeypots into your phone system with ready-to-use scripts and configurations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Setup Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-500" />
                Quick Setup Steps
              </CardTitle>
              <CardDescription>
                Get started in under 10 minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <h4 className="font-semibold">Configure Phone Numbers</h4>
                  <p className="text-sm text-gray-600">Set up forwarding to our honeypot numbers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <h4 className="font-semibold">Install Detection Script</h4>
                  <p className="text-sm text-gray-600">Add scam detection logic to your system</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <h4 className="font-semibold">Test & Monitor</h4>
                  <p className="text-sm text-gray-600">Verify setup and track blocked scams</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Honeypot Numbers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-orange-500" />
                Honeypot Numbers
              </CardTitle>
              <CardDescription>
                Forward suspicious calls to these numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-mono text-lg font-semibold">+1 (402) 302-0633</p>
                    <p className="text-sm text-gray-600">Consumer Line - Personal scams</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard("+14023020633", "Consumer honeypot number")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-mono text-lg font-semibold">+1 (888) 568-9418</p>
                    <p className="text-sm text-gray-600">Business Line - B2B scams</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard("+18885689418", "Business honeypot number")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Scripts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-orange-500" />
              Integration Scripts & Walkthroughs
            </CardTitle>
            <CardDescription>
              Ready-to-use code for popular phone systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeScript} onValueChange={setActiveScript}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="twilio">Twilio</TabsTrigger>
                <TabsTrigger value="asterisk">Asterisk</TabsTrigger>
                <TabsTrigger value="api">API Integration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="twilio" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Twilio Webhook Configuration</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(twilioScript, "Twilio script")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Script
                  </Button>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{twilioScript}</code>
                </pre>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Setup Instructions:</h5>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Add this webhook to your Twilio phone number configuration</li>
                    <li>Set the webhook URL to your server endpoint</li>
                    <li>Configure environment variables for Twilio credentials</li>
                    <li>Test with a known scam number to verify forwarding</li>
                  </ol>
                </div>
              </TabsContent>

              <TabsContent value="asterisk" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Asterisk Dialplan Configuration</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(asteriskScript, "Asterisk configuration")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Config
                  </Button>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{asteriskScript}</code>
                </pre>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Setup Instructions:</h5>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Add this configuration to your extensions.conf file</li>
                    <li>Create scam-detection.php script for caller scoring</li>
                    <li>Configure SIP trunk for PackieAI numbers</li>
                    <li>Reload Asterisk configuration and test</li>
                  </ol>
                </div>
              </TabsContent>

              <TabsContent value="api" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">API Integration Library</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(apiIntegration, "API integration code")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{apiIntegration}</code>
                </pre>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Usage Examples:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Report scam calls automatically from your system</li>
                    <li>Get AI-generated responses for custom integrations</li>
                    <li>Access real-time scam detection data</li>
                    <li>Build custom dashboards and monitoring tools</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Support Section */}
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="pt-6">
              <MessageSquare className="h-8 w-8 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Need Implementation Help?</h3>
              <p className="text-gray-600 mb-4">
                Our development team provides free setup assistance for qualified organizations.
              </p>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => window.location.href = '/admin#forum'}
              >
                Join Developer Forum
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}