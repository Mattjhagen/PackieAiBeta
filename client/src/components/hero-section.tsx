import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Rocket, Phone, Bot, Mic, Trash2 } from "lucide-react";
import packieHeroPath from "@assets/Untitled_-_May_27_2025_19.04.01.png";
import packieLogoPath from "@assets/ai_logo.png";

export default function HeroSection() {
  return (
    <section className="bg-gradient-hero text-white py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <Badge variant="secondary" className="inline-flex items-center bg-white/20 text-white border-white/30 mb-4 sm:mb-6 text-xs sm:text-sm">
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            AI-Powered Scam Fighter
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2">
            Give Scammers a Taste of Their Own Medicine
          </h1>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto px-4">
            Tired of scam calls? Feed them to Packie! Our AI trash panda answers your phone, 
            wastes scammers' time with clever personas, and turns their tricks against them.
          </p>
        </div>

        {/* Phone Numbers Section */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 text-center">
            <div className="bg-orange-500 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Phone className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">Consumer Honeypot</h3>
            <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold text-yellow-400 mb-3 sm:mb-4">
              (402) 302-0633
            </div>
            <p className="text-white/80 mb-3 sm:mb-4 text-sm sm:text-base">
              Give this number to telemarketers, sketchy websites, or anywhere you expect spam calls. 
              Packie will handle them for you!
            </p>
            <Button 
              onClick={() => navigator.clipboard.writeText('(402) 302-0633')}
              className="bg-yellow-500 text-gray-900 hover:bg-yellow-400 text-sm sm:text-base w-full sm:w-auto"
            >
              Copy Number
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 text-center">
            <div className="bg-purple-500 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Business Shield</h3>
            <div className="text-3xl font-mono font-bold text-yellow-400 mb-4">
              (888) 568-9418
            </div>
            <p className="text-white/80 mb-4">
              Professional AI protection for businesses. Packie screens calls and protects 
              your team from sophisticated scams.
            </p>
            <Button 
              onClick={() => navigator.clipboard.writeText('(888) 568-9418')}
              className="bg-yellow-500 text-gray-900 hover:bg-yellow-400"
            >
              Copy Number
            </Button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a 
              href="https://www.indiegogo.com/projects/packie-ai-the-trash-panda-that-fights-scams" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-green-600 text-white hover:bg-green-500 font-semibold px-8">
                <Rocket className="w-5 h-5 mr-2" />
                Support on Indiegogo
              </Button>
            </a>

          </div>
          <p className="text-white/70 text-sm">
            Help us build the ultimate scam-fighting AI. Every contribution brings us closer to a scam-free world!
          </p>
        </div>
      </div>
    </section>
  );
}
