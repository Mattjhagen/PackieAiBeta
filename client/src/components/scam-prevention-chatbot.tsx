import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  X,
  Minimize2,
  Maximize2
} from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  suggestions?: string[];
}

interface ScamAnalysis {
  isScam: boolean;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  suggestions: string[];
  reportable: boolean;
}

export default function ScamPreventionChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: "Hi! I'm PackieAI's scam prevention assistant. Share any suspicious message, call, or email with me and I'll help you identify if it's a scam. How can I protect you today?",
      timestamp: new Date(),
      riskLevel: 'low'
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const analyzeMessage = async (userMessage: string): Promise<ScamAnalysis> => {
    try {
      const response = await fetch('/api/chatbot/analyze-scam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing message:', error);
      return {
        isScam: false,
        confidence: 0,
        riskLevel: 'low',
        reasons: ['Unable to analyze message'],
        suggestions: ['Please try again or contact support'],
        reportable: false
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsAnalyzing(true);

    // Analyze the message for scam content
    const analysis = await analyzeMessage(inputMessage);

    // Create bot response based on analysis
    let botResponse = "";
    if (analysis.isScam) {
      botResponse = `🚨 **SCAM ALERT** - This appears to be a scam with ${analysis.confidence}% confidence.\n\n`;
      botResponse += `**Why this is suspicious:**\n${analysis.reasons.map(reason => `• ${reason}`).join('\n')}\n\n`;
      botResponse += `**What you should do:**\n${analysis.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}`;
      
      if (analysis.reportable) {
        botResponse += `\n\n📞 **Report this scam:** Forward this to our scammer database by calling (402) 302-0633`;
      }
    } else {
      botResponse = `✅ This message appears to be legitimate with ${100 - analysis.confidence}% confidence.\n\n`;
      if (analysis.suggestions.length > 0) {
        botResponse += `**Additional safety tips:**\n${analysis.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}`;
      }
    }

    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      message: botResponse,
      timestamp: new Date(),
      riskLevel: analysis.riskLevel,
      suggestions: analysis.suggestions
    };

    setMessages(prev => [...prev, botMessage]);
    setIsAnalyzing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'critical':
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Shield className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 shadow-xl border-2 ${isMinimized ? 'h-14' : 'h-[500px]'} transition-all duration-200`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-primary text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <CardTitle className="text-lg">Scam Prevention Assistant</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[440px]">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-primary text-white' 
                            : `${getRiskLevelColor(message.riskLevel)} border`
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            getRiskIcon(message.riskLevel)
                          )}
                        </div>
                        <div className={`rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-white'
                            : `${getRiskLevelColor(message.riskLevel)} border`
                        }`}>
                          <div className="whitespace-pre-line text-sm">
                            {message.message}
                          </div>
                          {message.riskLevel && message.riskLevel !== 'low' && (
                            <Badge 
                              variant="secondary" 
                              className={`mt-2 ${getRiskLevelColor(message.riskLevel)}`}
                            >
                              {message.riskLevel.toUpperCase()} RISK
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isAnalyzing && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center">
                        <Bot className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="bg-gray-100 border rounded-lg p-3">
                        <div className="text-sm text-gray-600">Analyzing for scam patterns...</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste suspicious message, email, or describe a call..."
                  className="flex-1"
                  disabled={isAnalyzing}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isAnalyzing || !inputMessage.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Share any suspicious content and I'll help identify potential scams
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}