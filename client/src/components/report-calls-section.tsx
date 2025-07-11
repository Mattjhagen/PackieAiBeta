import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Phone, Trash2, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import packieTrashPath from "@assets/IMG_0099.png";

export default function ReportCallsSection() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [scamType, setScamType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/scam-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          scamType,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      toast({
        title: "Scam Call Reported!",
        description: "Packie has been notified and will handle this scammer soon!",
      });

      setPhoneNumber("");
      setScamType("");
      setDescription("");
    } catch (error) {
      console.error('Error submitting scam report:', error);
      toast({
        title: "Report Failed",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scamTypes = [
    "Tech Support",
    "IRS/Tax Scam",
    "Medicare/Health",
    "Investment/Crypto",
    "Romance Scam",
    "Fake Charity",
    "Other"
  ];

  return (
    <section id="report-calls" className="bg-gradient-to-br from-pink-50 to-purple-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Report Scam Calls to Packie
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Got a suspicious call? Send it straight to Packie's trash can! Our AI will take over
            and keep the scammers busy so they can't bother anyone else.
          </p>
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-2">Quick Report via Discord</h3>
            <a href="https://discord.gg/6GpTcQFc" target="_blank" rel="noopener noreferrer" className="text-2xl font-bold hover:underline">
              💬 Join Discord
            </a>
            <p className="text-sm mt-2 opacity-90">Report scammer details to our community</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Report Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-t-lg">
              <h3 className="text-2xl font-bold flex items-center">
                <Trash2 className="w-6 h-6 mr-3" />
                Trash That Scam!
              </h3>
              <p className="text-pink-100">Help Packie take out another piece of scammer trash</p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="phone" className="text-lg font-medium">
                    Scammer Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-2 text-lg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="scam-type" className="text-lg font-medium">
                    Type of Scam
                  </Label>
                  <Select value={scamType} onValueChange={setScamType}>
                    <SelectTrigger className="mt-2 text-lg">
                      <SelectValue placeholder="Select scam type" />
                    </SelectTrigger>
                    <SelectContent>
                      {scamTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-lg font-medium">
                    What Did They Say? (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what the scammer told you..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 min-h-[100px]"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !phoneNumber || !scamType}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-lg py-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Sending to Packie...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5 mr-3" />
                      Send to Packie's Trash Can
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Packie Info */}
          <div className="space-y-8">
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <img
                  src={packieTrashPath}
                  alt="Packie with trash can"
                  className="w-32 h-32 mx-auto mb-6 rounded-full"
                />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  How Packie Handles Scammers
                </h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-600">
                      Packie calls the scammer back pretending to be interested
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Trash2 className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-600">
                      Uses clever distractions and endless questions to waste their time
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-600">
                      Keeps them busy so they can't scam other people
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-600">
                      Records everything for law enforcement and research
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold mb-3">Recent Success Stories</h4>
                <div className="space-y-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    <Badge className="bg-white/30 text-white mb-2">Tech Support</Badge>
                    <p className="text-sm">
                      "Packie kept a fake Microsoft scammer on the phone for 2 hours talking about 
                      organizing digital trash files!"
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <Badge className="bg-white/30 text-white mb-2">IRS Scam</Badge>
                    <p className="text-sm">
                      "Earl convinced a tax scammer to help him investigate their own scam operation!"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}