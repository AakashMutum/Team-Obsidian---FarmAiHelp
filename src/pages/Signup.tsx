import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { authService, RegisterData } from "@/services/api";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    location: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.password || (!formData.email && !formData.phone)) {
        throw new Error("Please fill in all required fields (Name, Password, and either Email or Phone)");
      }

      console.log("Attempting registration with:", {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        location: formData.location || undefined
      });

      // Test server connection first
      try {
        const healthResponse = await fetch('http://localhost:5000/api/health');
        if (!healthResponse.ok) {
          throw new Error(`Server health check failed: ${healthResponse.status}`);
        }
        console.log("✅ Server is reachable");
      } catch (serverError) {
        console.error("❌ Server connection failed:", serverError);
        throw new Error("Cannot connect to server. Please make sure the backend server is running at http://localhost:5000");
      }

      await authService.register(formData);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please log in.",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = "Please check your information and try again";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific error cases
        if (errorMessage.includes("409")) {
          errorMessage = "Email or phone number already registered. Please use different credentials or try logging in.";
        } else if (errorMessage.includes("Cannot connect")) {
          errorMessage = "Cannot connect to server. Please make sure the backend server is running.";
        }
      }
      
      toast({
        title: "Registration failed",
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

        {/* Registration Form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-center text-foreground">
              Create a Farmer Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="glass-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address (Optional if phone provided)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="farmer@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="glass-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional if email provided)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="glass-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={handleChange}
                  className="glass-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
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
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-muted-foreground text-sm flex items-center justify-center mx-auto"
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Already have an account? Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Empowering farmers with AI-driven crop planning
        </p>
      </div>
    </div>
  );
};

export default Signup;