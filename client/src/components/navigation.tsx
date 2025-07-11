import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Shield, Menu, Settings } from "lucide-react";
import { Link } from "wouter";
import packieLogoPath from "@assets/ai_logo.png";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "Live Dashboard", id: "live-dashboard" },
    { label: "Scam Trends", id: "scam-trends" },
    { label: "Tools", id: "tools" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img 
              src={packieLogoPath} 
              alt="Packie AI" 
              className="h-8 w-8 rounded-lg"
            />
            <span className="font-bold text-xl text-gray-900">Packie AI</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
            <Link href="/developer">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary">
                Developer Portal
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary">
                <Settings className="w-4 h-4 mr-1" />
                Admin
              </Button>
            </Link>
            <a 
              href="https://www.indiegogo.com/projects/packieai-scam-bot-that-waists-scammers-time/x/10825589#/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button className="bg-primary text-white hover:bg-indigo-700">
                Back on Indiegogo
              </Button>
            </a>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="text-left text-gray-600 hover:text-primary transition-colors py-2"
                  >
                    {link.label}
                  </button>
                ))}
                <Link href="/developer">
                  <Button variant="ghost" className="justify-start text-gray-600 hover:text-primary w-full">
                    Developer Portal
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="ghost" className="justify-start text-gray-600 hover:text-primary w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
                <a 
                  href="https://www.indiegogo.com/projects/packieai-scam-bot-that-waists-scammers-time/x/10825589#/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button className="bg-primary text-white hover:bg-indigo-700 mt-4">
                    Back on Indiegogo
                  </Button>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
