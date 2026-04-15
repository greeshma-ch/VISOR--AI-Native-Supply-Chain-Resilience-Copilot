import { Disruption, Supplier } from '../types';

export const fetchWeatherAlerts = async (suppliers: Supplier[]): Promise<Disruption[]> => {
  try {
    const locations = suppliers.map(s => ({
      lat: s.coordinates[0],
      lon: s.coordinates[1],
      name: s.location,
      supplierIds: [s.id]
    }));

    const response = await fetch('/api/weather/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locations }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch weather alerts');
    }

    return await response.json();
  } catch (error) {
    console.error('Weather service error:', error);
    return [];
  }
};

export const fetchCurrentWeather = async (lat: number, lon: number): Promise<any> => {
  try {
    const response = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`);
    if (!response.ok) {
      throw new Error('Failed to fetch current weather');
    }
    return await response.json();
  } catch (error) {
    console.error('Current weather service error:', error);
    return null;
  }
};
