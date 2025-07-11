import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Github, Code, Users, Star, GitFork } from "lucide-react";

export default function DeveloperCommunity() {
  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4 bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Join the Developer Community
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            Help us build the world's most advanced anti-scam platform. Contribute code, share ideas, and collaborate with developers worldwide.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Discord Community */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-indigo-600" />
                Discord Developer Hub
              </CardTitle>
              <CardDescription>
                Real-time collaboration, support, and development discussions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">500+</div>
                  <div className="text-sm text-gray-600">Active Developers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">24/7</div>
                  <div className="text-sm text-gray-600">Community Support</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Badge variant="outline" className="mr-2">API Help</Badge>
                <Badge variant="outline" className="mr-2">Code Reviews</Badge>
                <Badge variant="outline" className="mr-2">Feature Requests</Badge>
                <Badge variant="outline">Job Board</Badge>
              </div>
              
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => window.open('https://discord.gg/packie-ai', '_blank')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Join Discord Community
              </Button>
            </CardContent>
          </Card>

          {/* GitHub Repository */}
          <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-6 w-6 text-gray-800" />
                Open Source Project
              </CardTitle>
              <CardDescription>
                Contribute to the core platform and build integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-1">
                    <Star className="h-5 w-5" />
                    1.2k
                  </div>
                  <div className="text-sm text-gray-600">GitHub Stars</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-1">
                    <GitFork className="h-5 w-5" />
                    89
                  </div>
                  <div className="text-sm text-gray-600">Active Forks</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Badge variant="outline" className="mr-2">TypeScript</Badge>
                <Badge variant="outline" className="mr-2">React</Badge>
                <Badge variant="outline" className="mr-2">Node.js</Badge>
                <Badge variant="outline">PostgreSQL</Badge>
              </div>
              
              <Button 
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
                onClick={() => window.open('https://github.com/packie-ai/platform', '_blank')}
              >
                <Github className="h-4 w-4 mr-2" />
                View on GitHub
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contribution Areas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Code className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Core Development</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Enhance AI personas, improve scam detection algorithms, and build new platform features
              </p>
              <ul className="text-xs text-gray-500 space-y-1 mb-4">
                <li>• Voice AI improvements</li>
                <li>• Real-time analytics</li>
                <li>• Security enhancements</li>
              </ul>
              <Button 
                size="sm" 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => window.location.href = '/admin'}
              >
                Access Developer Hub
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Integrations</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Build connectors for phone systems, CRMs, and communication platforms
              </p>
              <ul className="text-xs text-gray-500 space-y-1 mb-4">
                <li>• Twilio connectors</li>
                <li>• API SDKs</li>
                <li>• Webhook handlers</li>
              </ul>
              <Button 
                size="sm" 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => window.location.href = '/admin#docs'}
              >
                View Implementation Guides
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <MessageSquare className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Community Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Help other developers, write documentation, and share implementation guides
              </p>
              <ul className="text-xs text-gray-500 space-y-1 mb-4">
                <li>• Tutorial creation</li>
                <li>• Code reviews</li>
                <li>• Bug reports</li>
              </ul>
              <Button 
                size="sm" 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => window.location.href = '/admin#forum'}
              >
                Join Developer Forum
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Make an Impact?</h3>
            <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
              Join hundreds of developers building the future of scam prevention. Your contributions help protect millions of people worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary"
                className="bg-white text-orange-600 hover:bg-orange-50"
                onClick={() => window.open('https://discord.gg/packie-ai', '_blank')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Join Discord
              </Button>
              <Button 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-orange-600"
                onClick={() => window.open('https://github.com/packie-ai/platform', '_blank')}
              >
                <Github className="h-4 w-4 mr-2" />
                Start Contributing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}