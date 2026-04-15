import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for weather alerts
  app.post("/api/weather/alerts", async (req, res) => {
    const { locations } = req.body; // Array of { lat, lon, name }
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      console.warn("OPENWEATHER_API_KEY is missing");
      return res.status(200).json([]); // Return empty array if not configured to avoid crashing frontend
    }

    try {
      const alerts = await Promise.all(
        locations.map(async (loc: any) => {
          try {
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&appid=${apiKey}&units=metric`
            );
            
            if (!response.ok) return null;
            
            const data: any = await response.json();
            
            if (data.weather && data.weather[0]) {
              const condition = data.weather[0].main;
              const description = data.weather[0].description;
              
              // Simple logic to identify "disruptions"
              const isDisruptive = ["Thunderstorm", "Snow", "Tornado", "Squall", "Dust", "Sand", "Ash"].includes(condition) || 
                                  (condition === "Rain" && data.rain && data.rain["1h"] > 10);

              if (isDisruptive) {
                return {
                  id: `weather-${loc.name}-${Date.now()}`,
                  title: `Weather Alert: ${condition} in ${loc.name}`,
                  type: "Weather",
                  severity: ["Tornado", "Thunderstorm", "Squall"].includes(condition) ? "High" : "Medium",
                  location: loc.name,
                  timestamp: new Date().toISOString(),
                  summary: `Severe weather condition (${description}) detected. Potential impact on logistics and supplier operations.`,
                  impactedSuppliers: loc.supplierIds || [],
                  weatherIcon: data.weather[0].icon
                };
              }
            }
          } catch (e) {
            console.error(`Error fetching weather for ${loc.name}:`, e);
          }
          return null;
        })
      );

      res.json(alerts.filter((a) => a !== null));
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // API Route for current weather details
  app.get("/api/weather/current", async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Weather API key not configured" });
    }

    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch from OpenWeatherMap");
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Current weather API error:", error);
      res.status(500).json({ error: "Failed to fetch current weather" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
