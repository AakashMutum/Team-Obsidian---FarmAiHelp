import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sprout, Phone, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/services/api";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("email");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const credentials = {
        ...(activeTab === "email" ? { email: formData.email } : { phone: formData.phone }),
        password: formData.password
      };
      
      console.log("Attempting login with:", JSON.stringify(credentials, null, 2));
      
      try {
        // First check if we can reach the server
        const serverCheckResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/health`);
        if (!serverCheckResponse.ok) {
          throw new Error(`Server returned status: ${serverCheckResponse.status}`);
        }
        console.log("Server reachable and healthy");
      } catch (serverError) {
        console.error("Server connection error:", serverError);
        throw new Error("Cannot connect to server. Please make sure the backend server is running at http://localhost:5000");
      }
      
      const response = await authService.login(credentials);
      
      // Save auth data
      authService.setToken(response.token);
      authService.setUserData(response.user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.name}!`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Please check your credentials and try again";
      
      if (error instanceof Error) {
        if (error.message.includes("Cannot connect to server")) {
          errorMessage = "Cannot connect to server. Please make sure the backend server is running.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
      <div className="w-full max-w-md">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-primary shadow-primary">
              <Sprout className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            AI Crop Planner
          </h1>
          <p className="text-muted-foreground">
            Smart farming solutions for Indian farmers
          </p>
        </div>

        {/* Login Form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-center text-foreground">
              Welcome Back, Farmer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleLogin} className="space-y-4">
                <TabsContent value="email" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="farmer@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="glass-input"
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="glass-input"
                      required
                    />
                  </div>
                </TabsContent>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="glass-input"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-farmer" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-muted-foreground text-sm"
                    onClick={() => navigate("/signup")}
                  >
                    New farmer? Create account
                  </Button>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Empowering farmers with AI-driven crop planning
        </p>
      </div>
    </div>
  );
};

export default Login;