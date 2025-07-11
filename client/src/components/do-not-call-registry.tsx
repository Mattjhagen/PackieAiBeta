import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShieldCheck, 
  Phone, 
  ExternalLink,
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface DoNotCallRegistration {
  phoneNumber: string;
  registrationType: 'add' | 'verify';
  email?: string;
}

export default function DoNotCallRegistry() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [registrationType, setRegistrationType] = useState<'add' | 'verify'>('add');
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const registerNumber = useMutation({
    mutationFn: async (data: DoNotCallRegistration) => {
      return apiRequest('/api/do-not-call/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response) => {
      toast({
        title: "Registration Successful",
        description: "Your number has been submitted to the National Do Not Call Registry.",
      });
      setPhoneNumber('');
      setEmail('');
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: "Please try again or register directly at donotcall.gov",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    registerNumber.mutate({
      phoneNumber: cleanedPhone,
      registrationType,
      email: email || undefined,
    });
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShieldCheck className="h-6 w-6 text-green-600" />
          <span>National Do Not Call Registry</span>
        </CardTitle>
        <CardDescription>
          Register your phone number to reduce unwanted telemarketing calls
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Information Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">About the Do Not Call Registry</p>
              <p className="text-blue-800">
                The National Do Not Call Registry is a free service managed by the Federal Trade Commission (FTC). 
                Registering your number makes it illegal for most telemarketers to call you.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Registration Type */}
          <div className="space-y-2">
            <Label>Action</Label>
            <Select value={registrationType} onValueChange={(value: 'add' | 'verify') => setRegistrationType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add my number to the registry</SelectItem>
                <SelectItem value="verify">Check if my number is registered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                className="pl-10"
                maxLength={14}
              />
            </div>
          </div>

          {/* Email (Optional) */}
          {registrationType === 'add' && (
            <div className="space-y-2">
              <Label htmlFor="email">Email Address (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
              <p className="text-xs text-gray-500">
                Email is optional but recommended for confirmation and updates.
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={registerNumber.isPending || !phoneNumber}
          >
            {registerNumber.isPending ? (
              'Processing...'
            ) : registrationType === 'add' ? (
              'Register My Number'
            ) : (
              'Check Registration Status'
            )}
          </Button>
        </form>

        {/* Important Notes */}
        <div className="space-y-4 text-sm">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <p>Registration is <strong>free</strong> and takes effect within 31 days</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <p>Registration never expires, but you can remove your number anytime</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <p>Some calls are still allowed: charities, political organizations, debt collectors, and surveys</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <p>Companies you've done business with can still call for 18 months</p>
          </div>
        </div>

        {/* Direct Link */}
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-3">
            You can also register directly with the FTC:
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open('https://www.donotcall.gov', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit DoNotCall.gov
          </Button>
        </div>

        {/* Additional Protection */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-900 mb-1">Additional Protection</p>
              <p className="text-green-800">
                For scam calls that bypass the registry, forward them to PackieAI at{' '}
                <span className="font-semibold">1-402-302-0633</span> or{' '}
                <span className="font-semibold">1-888-568-9418</span> to waste scammers' time.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}