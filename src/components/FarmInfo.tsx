import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wheat, Droplets, MapPin, Calendar } from "lucide-react";

const FarmInfo = () => {
  const currentCrops = [
    {
      name: "Wheat",
      area: "1.2 acres",
      plantedDate: "Nov 15, 2024",
      expectedHarvest: "Mar 20, 2025",
      status: "Growing",
      health: "Excellent",
    },
    {
      name: "Rice",
      area: "0.8 acres",
      plantedDate: "Oct 10, 2024",
      expectedHarvest: "Feb 15, 2025",
      status: "Flowering",
      health: "Good",
    },
    {
      name: "Sugarcane",
      area: "0.5 acres",
      plantedDate: "Sep 5, 2024",
      expectedHarvest: "Dec 30, 2024",
      status: "Maturing",
      health: "Excellent",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "growing":
        return "bg-primary/20 text-primary border-primary/30";
      case "flowering":
        return "bg-accent/20 text-accent border-accent/30";
      case "maturing":
        return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case "excellent":
        return "text-primary";
      case "good":
        return "text-accent";
      case "fair":
        return "text-orange-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Wheat className="h-5 w-5 text-primary" />
          Current Crops
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentCrops.map((crop, index) => (
            <div
              key={index}
              className="glass-card p-4 hover:bg-primary/5 transition-colors duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">
                    {crop.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {crop.area}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(crop.status)}>
                    {crop.status}
                  </Badge>
                  <p className={`text-sm mt-1 ${getHealthColor(crop.health)}`}>
                    {crop.health} Health
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Planted</p>
                    <p className="font-medium text-foreground">{crop.plantedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Harvest</p>
                    <p className="font-medium text-foreground">{crop.expectedHarvest}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Farm Overview */}
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="font-medium text-foreground mb-3">Farm Overview</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Soil Type</p>
              <p className="font-medium text-foreground">Black Cotton Soil</p>
            </div>
            <div>
              <p className="text-muted-foreground">Water Source</p>
              <p className="font-medium text-foreground">Bore Well + Rain</p>
            </div>
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium text-foreground">Pune, Maharashtra</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Area</p>
              <p className="font-medium text-foreground">2.5 Acres</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmInfo;