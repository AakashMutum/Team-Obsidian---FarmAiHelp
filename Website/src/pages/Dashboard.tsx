import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeatherWidget from "@/components/WeatherWidget";
import FarmInfo from "@/components/FarmInfo";
import CropInputForm from "@/components/CropInputForm";
import CropRecommendations from "@/components/CropRecommendations";
import { LogOut, BarChart3, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { authService, userService, User, FarmData } from "@/services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [farmData, setFarmData] = useState<FarmData | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      if (!authService.isLoggedIn()) {
        toast({
          title: "Authentication required",
          description: "Please log in to access the dashboard",
          variant: "destructive",
        });
        navigate("/");
        return false;
      }
      return true;
    };

    const fetchDashboardData = async () => {
      if (!checkAuth()) return;
      
      try {
        setLoading(true);
        const data = await userService.getDashboardData();
        setUser(data.user);
        setFarmData(data.farmData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Failed to load data",
          description: "There was a problem loading your farm information",
          variant: "destructive",
        });
        
        // If token is invalid, logout and redirect
        if (error instanceof Error && error.message.includes("authentication")) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, toast]);

  const handleLogout = () => {
    authService.removeToken();
    navigate("/");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                  Loading...
                </div>
              ) : (
                `Welcome, ${user?.name || "Farmer"}`
              )}
            </h1>
            <p className="text-muted-foreground">
              Your farm dashboard {user?.location ? `• ${user.location}` : ''}
            </p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="recommendations">AI Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Farm Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <FarmInfo />
              </div>
              <div>
                <WeatherWidget />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Land
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-foreground">
                        {farmData?.total_land || 0} Acres
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {farmData?.soil_type || "Soil type not specified"}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Crops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-primary">
                        {farmData?.active_crops?.length || 0} Types
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {farmData?.active_crops?.length 
                          ? farmData.active_crops.join(', ')
                          : "No active crops"
                        }
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Expected Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-accent">
                        ₹{(farmData?.expected_revenue || 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        This season projection
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="planning" className="space-y-6">
            <CropInputForm />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <CropRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;