import { Shield, Youtube, Twitter, Github, MessageCircle, Trash2 } from "lucide-react";
import packieLogoPath from "@assets/ai_logo.png";

export default function Footer() {
  const quickLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "AI Personas", href: "#personas" },
    { label: "Live Dashboard", href: "#dashboard" },
    { label: "Funding Goals", href: "#funding" },
  ];

  const supportLinks = [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Community", href: "#" },
    { label: "Contact Us", href: "#" },
  ];

  const socialLinks = [
    { icon: Youtube, href: "https://youtube.com/@packiemobile?si=CZSwNcCuVjuekvo3", label: "YouTube" },
    { icon: Twitter, href: "https://x.com/hagen_matt30623?s=21", label: "Twitter" },
    { icon: Github, href: "https://github.com/aclieAI/PackieAI", label: "GitHub" },
    { icon: MessageCircle, href: "https://discord.gg/6GpTcQFc", label: "Discord" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id.replace("#", ""));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src={packieLogoPath} 
                alt="Packie AI Logo" 
                className="h-10 w-10 rounded-lg"
              />
              <span className="font-bold text-2xl">Packie AI</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Packie the trash panda and team are taking out scammer trash one call at a time! 
              Every scam call we handle is one less victim they can reach. Join us in cleaning up the digital world!
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Project</h4>
            <ul className="space-y-2 text-gray-300">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Packie AI. All rights reserved. Taking out scammer trash since 2024.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Ethics Statement
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
