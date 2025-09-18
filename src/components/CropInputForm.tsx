import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Sprout, MapPin, Droplets, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CropInputForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    landSize: "",
    soilType: "",
    waterAvailability: "",
    budget: "",
    currentCrops: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Farm Details Updated",
      description: "AI is analyzing your farm data for crop recommendations.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Sprout className="h-5 w-5 text-primary" />
            Farm Planning Input
          </CardTitle>
          <p className="text-muted-foreground">
            Provide details about your farm to get personalized crop recommendations
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Land Size */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <Label className="text-foreground font-medium">Land Size (acres)</Label>
              </div>
              <Input
                type="number"
                placeholder="Enter land size in acres"
                value={formData.landSize}
                onChange={(e) =>
                  setFormData({ ...formData, landSize: e.target.value })
                }
                className="glass-input"
                step="0.1"
                min="0.1"
              />
            </div>

            {/* Soil Type */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Soil Type</Label>
              <Select
                value={formData.soilType}
                onValueChange={(value) =>
                  setFormData({ ...formData, soilType: value })
                }
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select your soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black-cotton">Black Cotton Soil</SelectItem>
                  <SelectItem value="red-soil">Red Soil</SelectItem>
                  <SelectItem value="alluvial">Alluvial Soil</SelectItem>
                  <SelectItem value="sandy">Sandy Soil</SelectItem>
                  <SelectItem value="clayey">Clayey Soil</SelectItem>
                  <SelectItem value="loamy">Loamy Soil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Water Availability */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-primary" />
                <Label className="text-foreground font-medium">Water Availability</Label>
              </div>
              <Select
                value={formData.waterAvailability}
                onValueChange={(value) =>
                  setFormData({ ...formData, waterAvailability: value })
                }
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select water source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bore-well">Bore Well</SelectItem>
                  <SelectItem value="canal">Canal Irrigation</SelectItem>
                  <SelectItem value="rain-fed">Rain Fed</SelectItem>
                  <SelectItem value="river">River/Stream</SelectItem>
                  <SelectItem value="multiple">Multiple Sources</SelectItem>
                  <SelectItem value="limited">Limited Water</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <Label className="text-foreground font-medium">Investment Budget (₹)</Label>
              </div>
              <Input
                type="number"
                placeholder="Enter your budget in rupees"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                className="glass-input"
              />
            </div>

            {/* Current Crops */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Current/Previous Crops</Label>
              <Input
                placeholder="e.g., Wheat, Rice, Cotton"
                value={formData.currentCrops}
                onChange={(e) =>
                  setFormData({ ...formData, currentCrops: e.target.value })
                }
                className="glass-input"
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Additional Notes</Label>
              <Textarea
                placeholder="Any specific requirements, challenges, or preferences..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="glass-input min-h-[80px]"
              />
            </div>

            <Button type="submit" className="w-full btn-farmer">
              Get AI Crop Recommendations
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CropInputForm;