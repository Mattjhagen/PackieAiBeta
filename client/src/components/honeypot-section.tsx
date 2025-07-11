import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Phone, Target, Zap, Clock, Shield, TrendingUp, Copy, Check, AlertTriangle, Bot, Edit3, MessageSquare, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function HoneypotSection() {
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [honeypotSuggestion, setHoneypotSuggestion] = useState("");
  const [deploymentOpen, setDeploymentOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("");
  const [generatedPost, setGeneratedPost] = useState("");
  const [userAge, setUserAge] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [copiedPost, setCopiedPost] = useState(false);
  const [activeNumber, setActiveNumber] = useState("local");
  const { toast } = useToast();

  const businessNumber = "1-888-568-9418"; // Business honeypot line
  const localNumber = "1-402-302-0633"; // Local consumer honeypot line

  const copyHoneypotNumber = async (numberType: "local" | "business") => {
    const numberToCopy = numberType === "local" ? localNumber : businessNumber;
    try {
      await navigator.clipboard.writeText(numberToCopy);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
      toast({
        title: "Copied!",
        description: `${numberType === "local" ? "Local" : "Business"} honeypot number copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const submitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Suggestion Submitted!",
      description: "Thanks for helping Packie find more scammers to trap!",
    });
    setHoneypotSuggestion("");
  };

  const platforms = [
    { id: "reddit", name: "Reddit", category: "Forum" },
    { id: "facebook", name: "Facebook Groups", category: "Social" },
    { id: "craigslist", name: "Craigslist", category: "Marketplace" },
    { id: "nextdoor", name: "Nextdoor", category: "Community" },
    { id: "discord", name: "Discord Servers", category: "Chat" },
    { id: "telegram", name: "Telegram Groups", category: "Chat" },
    { id: "investment-forum", name: "Investment Forums", category: "Financial" },
    { id: "tech-support", name: "Tech Support Forums", category: "Help" }
  ];

  const scenarios = {
    "reddit": [
      { id: "tech-help", name: "Need tech help", description: "Confused senior asking for computer help" },
      { id: "investment", name: "Investment advice", description: "Asking about crypto or investments" },
      { id: "medicare", name: "Medicare confusion", description: "Confused about Medicare benefits" },
      { id: "computer-problem", name: "Computer virus", description: "Think computer is infected" }
    ],
    "facebook": [
      { id: "marketplace", name: "Selling item", description: "Listing something for sale" },
      { id: "local-help", name: "Need local help", description: "Looking for tech help in local group" },
      { id: "senior-group", name: "Senior community", description: "Asking for help in senior groups" }
    ],
    "craigslist": [
      { id: "for-sale", name: "Item for sale", description: "Listing valuable item" },
      { id: "services", name: "Services needed", description: "Looking for computer/tech services" },
      { id: "housing", name: "Housing listing", description: "Rental or housing listing" }
    ],
    "investment-forum": [
      { id: "crypto-help", name: "Crypto confusion", description: "New to crypto, asking for help" },
      { id: "inheritance", name: "Large inheritance", description: "Just inherited money, need advice" },
      { id: "retirement", name: "Retirement funds", description: "Managing retirement savings" }
    ],
    "tech-support": [
      { id: "virus-help", name: "Virus removal", description: "Computer seems infected" },
      { id: "slow-computer", name: "Slow computer", description: "Computer running very slowly" },
      { id: "email-hacked", name: "Email hacked", description: "Think email was compromised" }
    ]
  };

  const generatePost = () => {
    if (!selectedPlatform || !selectedScenario || !userAge || !userLocation) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields to generate a post",
        variant: "destructive"
      });
      return;
    }

    // Determine which number to use based on scenario
    const getPhoneNumber = (scenario: string) => {
      const businessScenarios = ["services", "for-sale", "housing"];
      return businessScenarios.includes(scenario) ? businessNumber : localNumber;
    };

    const phoneNumber = getPhoneNumber(selectedScenario);

    const templates = {
      "tech-help": [
        `Hi everyone! I'm ${userAge} years old in ${userLocation} and having terrible computer problems. My computer keeps showing pop-ups and running very slow. My grandson usually helps but he's away at college. Can anyone recommend a good computer repair person? You can call me at ${phoneNumber}. I'm home most days and would really appreciate the help!`,
        `Hello, I really need help with my computer. I'm ${userAge} and not very good with technology. Something is wrong - it keeps freezing and I got scary messages about viruses. I heard there are people who can help over the phone? Please call me at ${phoneNumber} if you know anyone who can help an old person like me.`,
        `Computer problems! I'm ${userAge} and live in ${userLocation}. My computer has been acting strange - slow, pop-ups, weird messages. I don't know what to do and my family is busy. If anyone knows about computers and can help, please call ${phoneNumber}. I really need guidance!`
      ],
      "investment": [
        `I'm ${userAge} from ${userLocation} and just inherited a large sum from my late husband. I don't know anything about investing and I'm scared of making mistakes. Someone told me about cryptocurrency but I don't understand it. Can anyone give me advice? You can reach me at ${phoneNumber}. I'd really appreciate guidance from someone knowledgeable.`,
        `Hi, I'm ${userAge} and have some money in savings that's not earning much interest. I keep hearing about Bitcoin and other investments but I'm confused. My bank isn't very helpful. If anyone knows about investments and can explain things simply, please call me at ${phoneNumber}. I'm home most afternoons.`,
        `Investment help needed! I'm ${userAge} in ${userLocation} with retirement savings that need better returns. Everyone talks about crypto but I'm lost. Is it too late to start? Need someone patient to explain. Call ${phoneNumber} - I'm usually available and willing to learn.`
      ],
      "computer-problem": [
        `URGENT: Think my computer has a virus! I'm ${userAge} in ${userLocation} and my computer is acting crazy. Pop-ups everywhere, won't shut down properly. Someone told me hackers might have my information. I'm panicking! Can anyone help? Call ${phoneNumber} please!`,
        `Computer emergency! I'm ${userAge} and not tech-savvy. My computer shows scary warnings about viruses and wants me to call numbers. Is this real? I'm in ${userLocation} and need someone trustworthy to help. Please call ${phoneNumber} if you know about these things.`,
        `Help! I think I've been hacked. I'm ${userAge} from ${userLocation} and my computer is doing strange things. Files missing, slow performance, weird messages. I don't know who to trust. If you're good with computers, please call ${phoneNumber}. I'm scared I've lost everything.`
      ],
      "medicare": [
        `I'm ${userAge} in ${userLocation} and very confused about my Medicare benefits. I got a call saying there are problems with my account and they need to verify information. I'm worried I might lose my coverage. Has anyone else had this problem? I don't know who to trust. You can call me at ${phoneNumber} if you have advice.`,
        `Hello everyone, I need help understanding Medicare. I'm ${userAge} and got some confusing letters about my benefits being suspended. The phone number they gave doesn't seem right. Can someone who understands Medicare call me at ${phoneNumber}? I'm really worried about losing my healthcare.`,
        `Medicare confusion! I'm ${userAge} in ${userLocation} and received calls about my benefits being canceled. They want personal information to "fix" it. Is this legitimate? I'm scared to lose my healthcare. Anyone with Medicare knowledge please call ${phoneNumber}. I need guidance.`
      ],
      "marketplace": [
        `For Sale: ${userAge} year old widow selling late husband's tools and electronics. Everything must go! Call ${phoneNumber} to discuss prices. I'm in ${userLocation} and home most days. Cash only please, I don't understand electronic payments.`,
        `Estate Sale - ${userAge} yr old moving to assisted living. Selling furniture, jewelry, electronics. Some valuable items. Not sure of prices so willing to negotiate. Call ${phoneNumber} anytime. Located in ${userLocation}.`,
        `Moving Sale! I'm ${userAge} in ${userLocation} downsizing to smaller place. Selling deceased husband's collection - coins, watches, electronics. Not sure what things are worth. First come, first served. Call ${phoneNumber} to arrange viewing.`
      ],
      "local-help": [
        `Senior in ${userLocation} needs tech help! I'm ${userAge} and my computer/phone are giving me trouble. My kids live far away and I don't know who to ask locally. Anyone know a trustworthy person who helps seniors with technology? Please call ${phoneNumber}. Will pay for good help!`,
        `Looking for local tech support in ${userLocation}. I'm ${userAge} and struggle with modern technology. Need someone patient who won't take advantage of an older person. Willing to pay fair price. Call ${phoneNumber} if you can help or know someone who can.`
      ],
      "crypto-help": [
        `I'm ${userAge} from ${userLocation} and my neighbor told me I should invest in Bitcoin before it's too late. I have $50,000 in savings just sitting in the bank earning nothing. Can someone explain how to buy cryptocurrency? I don't want to miss out but I'm scared of losing my money. Please call ${phoneNumber} if you can help guide me through this.`,
        `New to investing at ${userAge}! Just sold my house and have money to invest. Keep hearing about crypto making people rich. I don't understand computers very well but want to learn. If you're experienced with Bitcoin and can help a senior citizen, please call ${phoneNumber}. I'm in ${userLocation}.`,
        `Crypto advice needed! I'm ${userAge} in ${userLocation} with substantial savings earning nothing. Friends say Bitcoin is the future but I'm technology-challenged. Need someone honest to walk me through it step by step. Call ${phoneNumber} - I'm willing to start with a large investment if it's safe.`
      ],
      "inheritance": [
        `Life-changing inheritance! I'm ${userAge} from ${userLocation} and recently inherited over $200,000 from my aunt. I've never had this much money and don't know what to do with it. Banking seems insufficient. Need investment advice from someone I can trust. Call ${phoneNumber} - this is overwhelming!`,
        `Large inheritance question: I'm ${userAge} in ${userLocation} and inherited substantial funds. Bank suggests CDs but I hear about better investments. Crypto? Stocks? I'm lost and don't want to make costly mistakes. Someone knowledgeable please call ${phoneNumber} to guide me.`
      ],
      "for-sale": [
        `For Sale: ${userAge} year old widow selling late husband's tools and electronics. Everything must go! Call ${phoneNumber} to discuss prices. I'm in ${userLocation} and home most days. Cash only please, I don't understand electronic payments.`,
        `Estate Sale - ${userAge} yr old moving to assisted living. Selling furniture, jewelry, electronics. Some valuable items. Not sure of prices so willing to negotiate. Call ${phoneNumber} anytime. Located in ${userLocation}.`,
        `Downsizing sale! I'm ${userAge} in ${userLocation} selling deceased spouse's belongings. Antiques, jewelry, collectibles. Don't know values so priced to sell. Serious buyers call ${phoneNumber}. Cash transactions only.`
      ],
      "services": [
        `Senior in ${userLocation} seeking computer repair services. I'm ${userAge} and my laptop is acting up - slow, crashes, strange pop-ups. Need honest technician who won't overcharge elderly person. References appreciated. Call ${phoneNumber} to discuss.`,
        `Computer help wanted! I'm ${userAge} in ${userLocation} and my computer needs professional attention. Virus warnings, slow performance. Looking for trustworthy tech person. Will pay cash for good service. Call ${phoneNumber} anytime.`
      ],
      "virus-help": [
        `VIRUS EMERGENCY! I'm ${userAge} in ${userLocation} and my computer is infected! Pop-ups say FBI locked my computer and I need to pay. Is this real? I'm scared and confused. Need expert help urgently. Call ${phoneNumber} please!`,
        `Computer virus nightmare! I'm ${userAge} and my computer shows warnings that I've been hacked. Messages demand payment to unlock files. Is this legitimate? I'm in ${userLocation} and need someone who knows about viruses. Please call ${phoneNumber}!`
      ],
      "slow-computer": [
        `My computer is dying! I'm ${userAge} in ${userLocation} and my computer takes forever to start and keeps freezing. I have important documents and photos I can't lose. Need someone who can help without charging fortune. Call ${phoneNumber} if you know computers.`,
        `Computer running like molasses! I'm ${userAge} from ${userLocation} and my laptop is painfully slow. Takes 20 minutes to start up. I'm told it might need cleaning or repair. Anyone know about computer speed issues? Call ${phoneNumber} to help.`
      ],
      "email-hacked": [
        `I think I've been hacked! I'm ${userAge} in ${userLocation} and friends say they're getting weird emails from me. I didn't send them! My passwords aren't working right either. This is scary - what should I do? Need help from someone who understands hacking. Call ${phoneNumber}!`,
        `Email account compromised! I'm ${userAge} from ${userLocation} and my email is sending messages I didn't write. Bank says someone tried to access my accounts. I'm panicking! Need immediate help from computer security expert. Please call ${phoneNumber}!`
      ]
    };

    const selectedTemplates = templates[selectedScenario as keyof typeof templates];
    if (selectedTemplates) {
      const randomTemplate = selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
      setGeneratedPost(randomTemplate);
    } else {
      // Fallback for scenarios without specific templates
      setGeneratedPost(`Hi, I'm ${userAge} from ${userLocation} and could really use some help. Please call me at ${phoneNumber} if you can assist. Thanks!`);
    }
  };

  const copyPost = async () => {
    try {
      await navigator.clipboard.writeText(generatedPost);
      setCopiedPost(true);
      setTimeout(() => setCopiedPost(false), 2000);
      toast({
        title: "Post Copied!",
        description: "The generated post is ready to paste",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const placementIdeas = [
    {
      category: "Tech Support Forums",
      description: "Post as confused user asking for help",
      effectiveness: "High",
      examples: ["Reddit tech support", "Microsoft community", "Apple support forums"]
    },
    {
      category: "Senior Community Sites",
      description: "Scammers target elderly users frequently",
      effectiveness: "Very High", 
      examples: ["AARP forums", "Senior center websites", "Medicare help sites"]
    },
    {
      category: "Investment Forums",
      description: "Crypto and investment scammers hunt here",
      effectiveness: "High",
      examples: ["Investment clubs", "Crypto forums", "Financial advice sites"]
    },
    {
      category: "Marketplace Listings",
      description: "Contact info in classified ads",
      effectiveness: "Medium",
      examples: ["Craigslist", "Facebook Marketplace", "Local classifieds"]
    }
  ];

  // Fetch real analytics data
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/latest"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: calls } = useQuery({
    queryKey: ["/api/calls"],
    refetchInterval: 30000,
  });

  const { data: dailyAnalytics } = useQuery({
    queryKey: ["/api/analytics/daily"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Calculate real statistics
  const getTodayCalls = () => {
    if (!calls || !Array.isArray(calls)) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return calls.filter((call: any) => new Date(call.createdAt) >= today).length;
  };

  const getActiveCalls = () => {
    if (!calls || !Array.isArray(calls)) return 0;
    return calls.filter((call: any) => call.status === 'active').length;
  };

  const getTotalDuration = () => {
    if (!calls || !Array.isArray(calls)) return "0 min";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCalls = calls.filter((call: any) => new Date(call.createdAt) >= today);
    const totalMinutes = todayCalls.reduce((sum: any, call: any) => sum + (call.duration || 0), 0);
    if (totalMinutes < 60) return `${totalMinutes} min`;
    return `${(totalMinutes / 60).toFixed(1)} hrs`;
  };

  const getSuccessRate = () => {
    if (!calls || !Array.isArray(calls)) return "0%";
    const completedCalls = calls.filter((call: any) => call.status === 'completed');
    if (completedCalls.length === 0) return "0%";
    const successfulCalls = completedCalls.filter((call: any) => (call.duration || 0) > 60); // Calls over 1 minute
    return `${Math.round((successfulCalls.length / completedCalls.length) * 100)}%`;
  };

  const getYesterdayComparison = () => {
    if (!calls || !Array.isArray(calls)) return "+0";
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const yesterdayCalls = calls.filter((call: any) => {
      const callDate = new Date(call.createdAt);
      return callDate >= yesterday && callDate < today;
    }).length;
    
    const todayCalls = getTodayCalls();
    const difference = todayCalls - yesterdayCalls;
    return difference >= 0 ? `+${difference}` : `${difference}`;
  };

  const liveStats = [
    { 
      label: "Scammers Trapped Today", 
      value: getTodayCalls().toString(), 
      trend: `${getYesterdayComparison()} from yesterday` 
    },
    { 
      label: "Time Wasted Today", 
      value: getTotalDuration(), 
      trend: calls && Array.isArray(calls) ? `${calls.length} total calls` : "Loading..."
    },
    { 
      label: "Active Calls", 
      value: getActiveCalls().toString(), 
      trend: "Currently in progress" 
    },
    { 
      label: "Success Rate", 
      value: getSuccessRate(), 
      trend: "Calls over 1 minute" 
    }
  ];

  return (
    <section id="honeypot" className="bg-gradient-to-br from-orange-50 to-red-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="inline-flex items-center bg-orange-100 text-orange-700 border-orange-200 mb-4">
            <Target className="w-4 h-4 mr-2" />
            Active Scammer Hunting
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Packie's Scammer Honeypot
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just wait for scammers to call victims - set traps and lure them to Packie! 
            Our honeypot number attracts scammers who think they've found an easy target.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {liveStats.map((stat, index) => (
            <Card key={index} className="text-center border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">{stat.value}</div>
                <div className="text-lg font-medium text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.trend}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="honeypot" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="honeypot">Honeypot Number</TabsTrigger>
            <TabsTrigger value="strategy">Placement Strategy</TabsTrigger>
            <TabsTrigger value="suggest">Suggest Locations</TabsTrigger>
          </TabsList>

          <TabsContent value="honeypot" className="space-y-8">
            <Card className="border-2 border-red-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-2xl">
                  <Phone className="w-6 h-6 mr-3" />
                  Packie's Honeypot Numbers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="text-center">
                    <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                      <h4 className="text-lg font-bold text-blue-800 mb-2">Local Consumer Line</h4>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{localNumber}</div>
                      <p className="text-sm text-blue-600 mb-3">For personal/consumer scenarios</p>
                      <Button
                        onClick={() => copyHoneypotNumber("local")}
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        {copiedNumber ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Local
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-orange-50 rounded-lg p-6 border-2 border-orange-200">
                      <h4 className="text-lg font-bold text-orange-800 mb-2">Business Line</h4>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{businessNumber}</div>
                      <p className="text-sm text-orange-600 mb-3">For business/commercial scenarios</p>
                      <Button
                        onClick={() => copyHoneypotNumber("business")}
                        variant="outline"
                        size="sm"
                        className="border-orange-500 text-orange-600 hover:bg-orange-50"
                      >
                        {copiedNumber ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Business
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                      How It Works
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <p className="text-gray-600">Post this number in places scammers look for victims</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <p className="text-gray-600">Scammers call thinking they found an easy target</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <p className="text-gray-600">Packie answers and wastes their time with clever conversations</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                        <p className="text-gray-600">Every minute they spend with Packie = less time scamming real people</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-500" />
                      Safety Features
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="font-medium text-green-800">Completely Safe</div>
                        <div className="text-sm text-green-600">Packie never gives out real information</div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="font-medium text-blue-800">Twilio-Powered</div>
                        <div className="text-sm text-blue-600">Professional VoIP system with AI integration</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="font-medium text-purple-800">Data Collection</div>
                        <div className="text-sm text-purple-600">Records scammer tactics for research</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {placementIdeas.map((idea, index) => (
                <Card key={index} className="border-2 border-orange-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{idea.category}</CardTitle>
                      <Badge 
                        variant={idea.effectiveness === "Very High" ? "destructive" : 
                                idea.effectiveness === "High" ? "default" : "secondary"}
                      >
                        {idea.effectiveness}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{idea.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900">Target Locations:</div>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {idea.examples.map((example, i) => (
                          <li key={i}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggest">
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Suggest Honeypot Locations
                </CardTitle>
                <p className="text-gray-600">
                  Help Packie find more scammers! Suggest websites or forums where we should post the honeypot number.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitSuggestion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website or Forum URL
                    </label>
                    <Input
                      type="url"
                      placeholder="https://example.com/forum"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why is this a good location?
                    </label>
                    <Textarea
                      placeholder="Explain why scammers might target this site..."
                      value={honeypotSuggestion}
                      onChange={(e) => setHoneypotSuggestion(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Target className="w-4 h-4 mr-2" />
                    Submit Suggestion
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6">
              <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to Deploy!
              </h3>
              <p className="text-gray-600 mb-4">
                Our Twilio-powered honeypot is ready to go live. Every scammer who calls this number 
                will be automatically handled by Packie AI, wasting their time and protecting real victims.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Dialog open={deploymentOpen} onOpenChange={setDeploymentOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      <Bot className="w-4 h-4 mr-2" />
                      Auto-Deploy Honeypot
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center text-2xl">
                        <Target className="w-6 h-6 mr-3 text-orange-500" />
                        Automated Honeypot Deployment
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Bot className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <h3 className="font-semibold text-blue-900">How This Works</h3>
                            <p className="text-sm text-blue-700">
                              Answer a few questions and we'll generate realistic posts that attract scammers to call your honeypot number. 
                              Simply copy and paste the generated content to deploy your trap.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="platform">Select Platform</Label>
                            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a platform" />
                              </SelectTrigger>
                              <SelectContent>
                                {platforms.map((platform) => (
                                  <SelectItem key={platform.id} value={platform.id}>
                                    {platform.name} ({platform.category})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedPlatform && scenarios[selectedPlatform as keyof typeof scenarios] && (
                            <div>
                              <Label htmlFor="scenario">Select Scenario</Label>
                              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a scenario" />
                                </SelectTrigger>
                                <SelectContent>
                                  {scenarios[selectedPlatform as keyof typeof scenarios].map((scenario) => (
                                    <SelectItem key={scenario.id} value={scenario.id}>
                                      {scenario.name} - {scenario.description}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="age">Age (for persona)</Label>
                            <Select value={userAge} onValueChange={setUserAge}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select age range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="65">65</SelectItem>
                                <SelectItem value="70">70</SelectItem>
                                <SelectItem value="75">75</SelectItem>
                                <SelectItem value="80">80</SelectItem>
                                <SelectItem value="85">85</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              value={userLocation}
                              onChange={(e) => setUserLocation(e.target.value)}
                              placeholder="e.g., Florida, Texas, California"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <Button 
                          onClick={generatePost}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                          disabled={!selectedPlatform || !selectedScenario || !userAge || !userLocation}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Generate Honeypot Post
                        </Button>
                      </div>

                      {generatedPost && (
                        <div className="space-y-4">
                          <div className="bg-gray-50 border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-gray-900 flex items-center">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Generated Post
                              </h3>
                              <Button
                                onClick={copyPost}
                                variant="outline"
                                size="sm"
                                className="border-orange-500 text-orange-600 hover:bg-orange-50"
                              >
                                {copiedPost ? (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Post
                                  </>
                                )}
                              </Button>
                            </div>
                            <div className="bg-white border rounded p-3 text-sm">
                              {generatedPost}
                            </div>
                          </div>

                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <Check className="w-5 h-5 text-green-500 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-green-900">Ready to Deploy</h4>
                                <p className="text-sm text-green-700">
                                  Copy the generated post and paste it on {platforms.find(p => p.id === selectedPlatform)?.name}. 
                                  Scammers who call the honeypot number will be automatically handled by Packie AI.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-yellow-900">Deployment Tips</h4>
                                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                                  <li>• Post during peak hours when scammers are most active</li>
                                  <li>• Use a believable username that matches the persona age</li>
                                  <li>• Avoid posting multiple times in the same community</li>
                                  <li>• Monitor the honeypot dashboard for incoming calls</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                
                <a href="tel:18885689418">
                  <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Honeypot Now
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