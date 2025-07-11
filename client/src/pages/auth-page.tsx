import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Mail, 
  Lock, 
  User, 
  CheckCircle, 
  ArrowRight,
  Bot,
  Code,
  MessageSquare
} from "lucide-react";
import packieLogoPath from "@assets/ai_logo.png";

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}

interface LoginData {
  username: string;
  password: string;
}

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [loginData, setLoginData] = useState<LoginData>({ username: "", password: "" });
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
    acceptedPrivacy: false
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in to PackieAI.",
      });
      setLocation("/developer");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: Omit<RegisterData, 'confirmPassword'>) => {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    },
    onSuccess: () => {
      setRegistrationSuccess(true);
      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      toast({
        title: "Missing information",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.username || !registerData.email || !registerData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password.length < 8) {
      toast({
        title: "Weak password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    const { confirmPassword, ...userData } = registerData;
    registerMutation.mutate(userData);
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to <strong>{registerData.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>Click the link in your email to verify your account and start using PackieAI.</p>
              <p>Can't find the email? Check your spam folder.</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setRegistrationSuccess(false)}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left side - Forms */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <Link href="/">
                <img 
                  src={packieLogoPath} 
                  alt="PackieAI" 
                  className="h-12 w-12 mx-auto mb-4" 
                />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to PackieAI</h1>
              <p className="text-gray-600 mt-2">Join the fight against phone scams</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">Username</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-username"
                            type="text"
                            placeholder="Enter your username"
                            value={loginData.username}
                            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                      Join the PackieAI community and help fight scams
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-username">Username</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-username"
                            type="text"
                            placeholder="Choose a username"
                            value={registerData.username}
                            onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="Enter your email"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="Create a strong password"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-confirm-password"
                            type="password"
                            placeholder="Confirm your password"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            id="accept-terms"
                            checked={registerData.acceptedTerms}
                            onChange={(e) => setRegisterData({ ...registerData, acceptedTerms: e.target.checked })}
                            className="mt-0.5"
                            required
                          />
                          <label htmlFor="accept-terms" className="text-sm text-gray-600">
                            I accept the{" "}
                            <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                              Terms of Service
                            </a>
                          </label>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            id="accept-privacy"
                            checked={registerData.acceptedPrivacy}
                            onChange={(e) => setRegisterData({ ...registerData, acceptedPrivacy: e.target.checked })}
                            className="mt-0.5"
                            required
                          />
                          <label htmlFor="accept-privacy" className="text-sm text-gray-600">
                            I accept the{" "}
                            <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                              Privacy Policy
                            </a>
                          </label>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending || !registerData.acceptedTerms || !registerData.acceptedPrivacy}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="text-center">
              <Link href="/" className="text-sm text-blue-600 hover:underline">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Right side - Hero */}
        <div className="hidden lg:flex items-center justify-center p-8 bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="text-center text-white space-y-6 max-w-md">
            <div className="space-y-4">
              <Shield className="h-16 w-16 mx-auto" />
              <h2 className="text-3xl font-bold">Protect Your Community</h2>
              <p className="text-xl text-blue-100">
                Join thousands of users fighting phone scams with AI-powered protection
              </p>
            </div>

            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <Bot className="h-5 w-5 text-blue-300" />
                <span>AI-powered scam detection and prevention</span>
              </div>
              <div className="flex items-center space-x-3">
                <Code className="h-5 w-5 text-blue-300" />
                <span>Developer APIs and integration guides</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-blue-300" />
                <span>Community forum and support</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-100">
                "PackieAI has helped our community reduce scam calls by over 80%. The AI personas are incredibly effective at wasting scammers' time."
              </p>
              <p className="text-xs text-blue-200 mt-2">- Community Member</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}