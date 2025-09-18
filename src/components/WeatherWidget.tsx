import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer } from "lucide-react";

const WeatherWidget = () => {
  const currentWeather = {
    temperature: 28,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 8,
    rainfall: 2.3,
  };

  const forecast = [
    { day: "Today", temp: 28, condition: "cloudy", icon: Cloud },
    { day: "Tomorrow", temp: 31, condition: "sunny", icon: Sun },
    { day: "Thu", temp: 26, condition: "rainy", icon: CloudRain },
    { day: "Fri", temp: 29, condition: "sunny", icon: Sun },
  ];

  return (
    <Card className="weather-widget">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Thermometer className="h-5 w-5 text-primary" />
          Weather Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground mb-1">
            {currentWeather.temperature}°C
          </div>
          <p className="text-muted-foreground text-sm">
            {currentWeather.condition}
          </p>
        </div>

        {/* Weather Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-muted-foreground">Humidity</p>
              <p className="font-medium text-foreground">{currentWeather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-muted-foreground">Wind</p>
              <p className="font-medium text-foreground">{currentWeather.windSpeed} km/h</p>
            </div>
          </div>
        </div>

        {/* 4-Day Forecast */}
        <div className="space-y-2">
          <h4 className="font-medium text-foreground">4-Day Forecast</h4>
          <div className="space-y-2">
            {forecast.map((day, index) => {
              const IconComponent = day.icon;
              return (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground w-16">
                    {day.day}
                  </span>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {day.temp}°C
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rainfall Alert */}
        <div className="glass-card p-3 border-primary/30 bg-primary/10">
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Expected Rainfall
              </p>
              <p className="text-xs text-muted-foreground">
                {currentWeather.rainfall}mm in next 24 hours
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;