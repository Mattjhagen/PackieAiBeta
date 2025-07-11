import ImplementationGuide from "@/components/implementation-guide";

export default function Guide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Implementation Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete setup instructions for deploying PackieAI honeypots and social media monitoring
          </p>
        </div>
        
        <ImplementationGuide />
      </div>
    </div>
  );
}