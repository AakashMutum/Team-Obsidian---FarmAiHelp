import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Target, Droplets, Calendar } from "lucide-react";

const CropRecommendations = () => {
  const [hoveredCrop, setHoveredCrop] = useState<string | null>(null);

  const cropRecommendations = [
    {
      name: "Tomato",
      successRate: 85,
      investment: 25000,
      expectedProfit: 75000,
      likelihood: "High",
      season: "Rabi",
      waterRequirement: "Medium",
      marketData: [
        { month: "Nov", price: 20 },
        { month: "Dec", price: 25 },
        { month: "Jan", price: 30 },
        { month: "Feb", price: 35 },
        { month: "Mar", price: 28 },
        { month: "Apr", price: 22 },
      ],
    },
    {
      name: "Onion",
      successRate: 78,
      investment: 15000,
      expectedProfit: 45000,
      likelihood: "High",
      season: "Rabi",
      waterRequirement: "Low",
      marketData: [
        { month: "Nov", price: 15 },
        { month: "Dec", price: 18 },
        { month: "Jan", price: 22 },
        { month: "Feb", price: 25 },
        { month: "Mar", price: 30 },
        { month: "Apr", price: 28 },
      ],
    },
    {
      name: "Maize",
      successRate: 72,
      investment: 12000,
      expectedProfit: 35000,
      likelihood: "Medium",
      season: "Kharif",
      waterRequirement: "Medium",
      marketData: [
        { month: "Nov", price: 18 },
        { month: "Dec", price: 19 },
        { month: "Jan", price: 21 },
        { month: "Feb", price: 23 },
        { month: "Mar", price: 25 },
        { month: "Apr", price: 24 },
      ],
    },
    {
      name: "Cotton",
      successRate: 65,
      investment: 30000,
      expectedProfit: 80000,
      likelihood: "Medium",
      season: "Kharif",
      waterRequirement: "High",
      marketData: [
        { month: "Nov", price: 45 },
        { month: "Dec", price: 48 },
        { month: "Jan", price: 52 },
        { month: "Feb", price: 55 },
        { month: "Mar", price: 50 },
        { month: "Apr", price: 47 },
      ],
    },
    {
      name: "Chickpea",
      successRate: 88,
      investment: 8000,
      expectedProfit: 28000,
      likelihood: "High",
      season: "Rabi",
      waterRequirement: "Low",
      marketData: [
        { month: "Nov", price: 55 },
        { month: "Dec", price: 58 },
        { month: "Jan", price: 62 },
        { month: "Feb", price: 65 },
        { month: "Mar", price: 68 },
        { month: "Apr", price: 70 },
      ],
    },
    {
      name: "Sugarcane",
      successRate: 70,
      investment: 45000,
      expectedProfit: 120000,
      likelihood: "Medium",
      season: "Annual",
      waterRequirement: "High",
      marketData: [
        { month: "Nov", price: 28 },
        { month: "Dec", price: 30 },
        { month: "Jan", price: 32 },
        { month: "Feb", price: 35 },
        { month: "Mar", price: 38 },
        { month: "Apr", price: 36 },
      ],
    },
  ];

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood.toLowerCase()) {
      case "high":
        return "bg-primary/20 text-primary border-primary/30";
      case "medium":
        return "bg-accent/20 text-accent border-accent/30";
      case "low":
        return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getWaterRequirementColor = (requirement: string) => {
    switch (requirement.toLowerCase()) {
      case "low":
        return "text-primary";
      case "medium":
        return "text-accent";
      case "high":
        return "text-orange-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Target className="h-5 w-5 text-primary" />
            AI Crop Recommendations
          </CardTitle>
          <p className="text-muted-foreground">
            Based on your farm data, soil type, and current market conditions
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cropRecommendations.map((crop, index) => (
          <Card
            key={index}
            className="crop-stat-card relative overflow-hidden"
            onMouseEnter={() => setHoveredCrop(crop.name)}
            onMouseLeave={() => setHoveredCrop(null)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-foreground">
                    {crop.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getLikelihoodColor(crop.likelihood)}>
                      {crop.likelihood} Success
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                      {crop.season}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {crop.successRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Success Rate Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Success Probability</span>
                </div>
                <Progress value={crop.successRate} className="h-2" />
              </div>

              {/* Financial Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Investment</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    ₹{crop.investment.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-xs text-muted-foreground">Expected Profit</span>
                  </div>
                  <p className="font-semibold text-primary">
                    ₹{crop.expectedProfit.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Water:</span>
                  <span className={getWaterRequirementColor(crop.waterRequirement)}>
                    {crop.waterRequirement}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Season:</span>
                  <span className="text-foreground">{crop.season}</span>
                </div>
              </div>

              {/* Market Price Chart - Shows on Hover */}
              {hoveredCrop === crop.name && (
                <div className="mt-4 p-3 glass-card">
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Market Price Trend (₹/kg)
                  </h4>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={crop.marketData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CropRecommendations;