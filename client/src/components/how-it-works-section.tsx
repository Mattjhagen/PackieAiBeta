import { Card, CardContent } from "@/components/ui/card";
import { Phone, Bot, Clock, Mic, TrendingUp, ArrowRight, FileText, Shield } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: Phone,
      title: "Report to Packie",
      description: "Users report scam calls which Packie then handles automatically",
    },
    {
      icon: Bot,
      title: "Packie Engages",
      description: "Our AI trash panda calls back with curious questions and distractions",
    },
    {
      icon: Clock,
      title: "Trash Time",
      description: "Scammers get stuck talking about garbage collection and random topics",
    },
    {
      icon: FileText,
      title: "Data Collection",
      description: "Calls are recorded, transcribed, and analyzed to identify scam patterns",
    },
    {
      icon: Shield,
      title: "Community Protection",
      description: "Intelligence is shared to help protect others from similar scam attempts",
    },
  ];

  return (
    <section id="how-it-works" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How Packie Takes Out The Trash</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI trash panda system automatically detects and engages scammers, keeping them occupied
            while collecting valuable intelligence on fraud tactics - then tosses their scams in the digital trash!
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <step.icon className="text-white w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
          
          {/* Arrows between steps */}
          {[0, 1, 2, 3].map((index) => (
            <div key={`arrow-${index}`} className="hidden lg:flex items-center justify-center">
              <ArrowRight className="text-gray-400 w-6 h-6" />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recording & Analysis */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-red-500 rounded-lg p-3">
                  <Mic className="text-white w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold">Recording & Analysis</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Every call is recorded, transcribed, and analyzed using advanced AI to identify
                scam patterns, keywords, and tactics.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                <div className="text-red-500 mb-2">SCAM DETECTED: Tech Support</div>
                <div className="text-gray-600">Keywords: "computer virus", "urgent", "payment"</div>
                <div className="text-gray-600">Confidence: 97.3%</div>
              </div>
            </CardContent>
          </Card>

          {/* Data Intelligence */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-500 rounded-lg p-3">
                  <TrendingUp className="text-white w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold">Intelligence Gathering</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Collected data helps researchers and law enforcement understand scam trends
                and develop better protection strategies.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tech Support Scams</span>
                  <span className="text-sm font-medium">42%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "42%" }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">IRS/Tax Scams</span>
                  <span className="text-sm font-medium">28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "28%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
