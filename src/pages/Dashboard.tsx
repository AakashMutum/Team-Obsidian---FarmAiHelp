import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeatherWidget from "@/components/WeatherWidget";
import FarmInfo from "@/components/FarmInfo";
import CropInputForm from "@/components/CropInputForm";
import CropRecommendations from "@/components/CropRecommendations";
import { LogOut, BarChart3 } from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome, Rajesh Kumar
            </h1>
            <p className="text-muted-foreground">
              Your farm dashboard • Pune, Maharashtra
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
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
                  <div className="text-2xl font-bold text-foreground">2.5 Acres</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fertile agricultural land
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Crops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">3 Types</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Wheat, Rice, Sugarcane
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Expected Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">₹1,25,000</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This season projection
                  </p>
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