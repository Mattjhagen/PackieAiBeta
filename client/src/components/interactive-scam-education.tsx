import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  Brain, 
  Phone, 
  AlertTriangle, 
  Target, 
  CheckCircle, 
  TrendingUp,
  Clock,
  MessageSquare
} from "lucide-react";

interface EducationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  stats?: {
    label: string;
    value: string;
    trend?: string;
  };
}

export default function InteractiveScamEducation() {
  const [activeStep, setActiveStep] = useState("detection");

  const educationSteps: EducationStep[] = [
    {
      id: "detection",
      title: "Scam Detection",
      description: "How PackieAI identifies and intercepts scammer calls",
      icon: <Shield className="w-8 h-8" />,
      details: [
        "Real-time phone number analysis using FTC databases",
        "Pattern recognition from known scammer behavior",
        "Social media monitoring for emerging scam campaigns",
        "Automated threat intelligence gathering"
      ],
      stats: {
        label: "Detection Rate",
        value: "94.7%",
        trend: "↑ 12% this month"
      }
    },
    {
      id: "personas",
      title: "AI Personas",
      description: "Meet the characters that waste scammers' time",
      icon: <Users className="w-8 h-8" />,
      details: [
        "Harold - Confused elderly gentleman who asks lots of questions",
        "Margaret - Overly cautious grandmother with hearing issues",
        "Steve - Overly helpful but technically incompetent",
        "Brenda - Chatty customer service representative"
      ],
      stats: {
        label: "Average Call Time",
        value: "18.3 min",
        trend: "↑ 3.2 min longer"
      }
    },
    {
      id: "engagement",
      title: "Engagement Strategy",
      description: "How our AI keeps scammers on the line",
      icon: <Brain className="w-8 h-8" />,
      details: [
        "Strategic confusion and misunderstanding",
        "Asking for repeated information and clarification",
        "Fake technical difficulties and connection issues",
        "Realistic background sounds and interruptions"
      ],
      stats: {
        label: "Time Wasted",
        value: "847 hours",
        trend: "This week alone"
      }
    },
    {
      id: "protection",
      title: "Community Protection",
      description: "How wasting scammers' time protects everyone",
      icon: <Target className="w-8 h-8" />,
      details: [
        "Each minute on our line is time not spent targeting real victims",
        "Scammers become frustrated and may quit earlier",
        "Economic disruption of scammer operations",
        "Data collection helps improve fraud detection"
      ],
      stats: {
        label: "Calls Prevented",
        value: "2,847",
        trend: "Estimated this month"
      }
    }
  ];

  const currentStep = educationSteps.find(step => step.id === activeStep) || educationSteps[0];

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          {educationSteps.map((step) => (
            <TabsTrigger key={step.id} value={step.id} className="flex items-center gap-2">
              <div className="text-primary">{step.icon}</div>
              <span className="hidden sm:inline">{step.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {educationSteps.map((step) => (
          <TabsContent key={step.id} value={step.id}>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Main Content Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {step.icon}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{step.title}</CardTitle>
                      <CardDescription className="text-lg">{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {step.details.map((detail, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{detail}</p>
                      </div>
                    ))}
                  </div>
                  
                  {step.stats && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{step.stats.label}</p>
                          <p className="text-2xl font-bold text-gray-900">{step.stats.value}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {step.stats.trend}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Interactive Demo Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Live Example
                  </CardTitle>
                  <CardDescription>
                    {step.id === "detection" && "See how we identify scammer calls"}
                    {step.id === "personas" && "Listen to our AI personas in action"}
                    {step.id === "engagement" && "Watch engagement tactics at work"}
                    {step.id === "protection" && "Real-time impact on scammer operations"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {step.id === "detection" && (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="font-semibold text-red-800">Scammer Detected</span>
                        </div>
                        <p className="text-sm text-red-700">+1 (555) 123-4567</p>
                        <p className="text-xs text-red-600 mt-1">
                          Known robocaller • Tech support scam • High confidence
                        </p>
                      </div>
                      <div className="text-center">
                        <Button className="w-full">
                          <Phone className="w-4 h-4 mr-2" />
                          Route to AI Persona
                        </Button>
                      </div>
                    </div>
                  )}

                  {step.id === "personas" && (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">H</span>
                          </div>
                          <span className="font-semibold">Harold (Active)</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>"Wait, can you repeat that again? My hearing aid..."</p>
                          <p className="text-xs text-blue-600">⏱ 12:34 elapsed</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">Listen to Call</Button>
                        <Button variant="outline" size="sm">Switch Persona</Button>
                      </div>
                    </div>
                  )}

                  {step.id === "engagement" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm">🎯 <strong>Strategy:</strong> Fake confusion</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">💬 "I'm sorry, did you say Microsoft or Microphone?"</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm">✅ <strong>Result:</strong> +2.3 minutes wasted</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.id === "protection" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Clock className="w-6 h-6 mx-auto text-green-600 mb-1" />
                          <p className="text-sm font-semibold">18 min</p>
                          <p className="text-xs text-gray-600">Average waste</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <TrendingUp className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                          <p className="text-sm font-semibold">94.7%</p>
                          <p className="text-xs text-gray-600">Success rate</p>
                        </div>
                      </div>
                      <p className="text-sm text-center text-gray-600">
                        Every call we handle protects potential victims in your community
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-primary to-indigo-600 text-white p-8 rounded-xl">
          <h3 className="text-2xl font-bold mb-4">Ready to Join the Fight?</h3>
          <p className="text-lg mb-6 opacity-90">
            Help us waste scammers' time and protect your community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <Phone className="w-5 h-5 mr-2" />
              Call Our Numbers
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <MessageSquare className="w-5 h-5 mr-2" />
              Report Scammers
            </Button>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-6 justify-center text-sm opacity-80">
            <span>📞 Personal: (402) 302-0633</span>
            <span>🏢 Business: (888) 568-9418</span>
          </div>
        </div>
      </div>
    </div>
  );
}