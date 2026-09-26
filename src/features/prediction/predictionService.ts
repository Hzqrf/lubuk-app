import { getMoonPhase } from '../weather/MoonPhaseWidget';
import { WeatherDataPayload } from '../weather/WeatherWidget';

export interface SpeciesActivity {
  species: string;
  score: number; // 0 - 100
  label: 'Poor' | 'Moderate' | 'Good' | 'Excellent';
  reason: string;
}

export interface PredictionResult {
  overallScore: number;
  overallLabel: 'Poor' | 'Moderate' | 'Good' | 'Excellent';
  speciesBreakdown: SpeciesActivity[];
  astronomicalInfluence: string;
  weatherInfluence: string;
}

export function calculateActivityPrediction(
  lat: number,
  lng: number,
  weather: WeatherDataPayload | null,
  recentCatchesCount: number = 0,
  date: Date = new Date()
): PredictionResult {
  let baseScore = 50;

  // 1. Lunar Influence
  const moon = getMoonPhase(date);
  let lunarBoost = 0;
  let astroNote = '';

  // New moon and Full moon trigger higher feeding rates due to tidal / gravitational peaks
  if (moon.name === 'New Moon' || moon.name === 'Full Moon') {
    lunarBoost = 15;
    astroNote = 'Strong gravitational pull near New/Full moon boosts fish activity!';
  } else if (moon.name === 'First Quarter' || moon.name === 'Last Quarter') {
    lunarBoost = 5;
    astroNote = 'Moderate activity during half moon phases.';
  } else {
    lunarBoost = 10;
    astroNote = 'Crescent phases trigger decent evening/morning feeding activity.';
  }
  baseScore += lunarBoost;

  // 2. Solar / Time-of-Day Influence
  const hour = date.getHours();
  let timeBoost = 0;
  if ((hour >= 6 && hour <= 8) || (hour >= 17 && hour <= 19)) {
    timeBoost = 15; // Golden hours
  } else if (hour >= 11 && hour <= 14) {
    timeBoost = -10; // Midday slump
  } else {
    timeBoost = 5; // Normal hours
  }
  baseScore += timeBoost;

  // 3. Weather Influence
  let weatherBoost = 0;
  let weatherNote = 'No weather telemetry detected - calculating astronomical baselines.';

  if (weather && weather.current) {
    const temp = weather.current.temperature_2m;
    const rain = weather.current.rain;
    const code = weather.current.weather_code;
    const press = weather.current.pressure_msl;

    // Temp scoring (optimal: 24 - 30 for tropical fish)
    if (temp >= 24 && temp <= 30) {
      weatherBoost += 10;
    } else if (temp < 22 || temp > 33) {
      weatherBoost -= 15;
    }

    // Rain scoring
    if (rain > 0 && rain <= 2) {
      weatherBoost += 12; // Light drizzle is excellent
      weatherNote = 'Light rain increases water oxygen levels and triggers feeding!';
    } else if (rain > 5) {
      weatherBoost -= 20; // Heavy storm shuts down activity
      weatherNote = 'Heavy rainfall and storms shut down fish activity.';
    } else if (code >= 1 && code <= 3) {
      weatherBoost += 5; // Partly cloudy is good cover
      weatherNote = 'Light cloud cover reduces glare and improves active feeding.';
    } else {
      weatherNote = 'Stable weather forecasts suggest standard activity.';
    }

    // Pressure trend
    if (press >= 995 && press <= 1012) {
      weatherBoost += 5;
    } else {
      weatherBoost -= 8;
    }
  }
  baseScore += weatherBoost;

  // 4. Spot Catch Frequency Influence
  const catchBoost = Math.min(recentCatchesCount * 6, 20); // up to 20 points
  baseScore += catchBoost;

  // Clamp overall score
  const finalScore = Math.max(10, Math.min(100, baseScore));

  const getLabel = (s: number): 'Poor' | 'Moderate' | 'Good' | 'Excellent' => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Moderate';
    return 'Poor';
  };

  const overallLabel = getLabel(finalScore);

  // 5. Species breakdown
  const speciesList = ['Haruan', 'Toman', 'Patin', 'Peacock Bass', 'Tilapia'];
  const speciesBreakdown: SpeciesActivity[] = speciesList.map((species) => {
    let specScore = finalScore;
    let specReason = '';

    const isLightRain = weather ? (weather.current.rain > 0 && weather.current.rain <= 2) : false;
    const isStorm = weather ? (weather.current.rain > 5) : false;
    const isSunny = weather ? (weather.current.weather_code === 0) : true;
    const currentTemp = weather ? weather.current.temperature_2m : 28;

    switch (species) {
      case 'Haruan':
        // Haruan loves light rain and morning golden hour
        if (isLightRain) {
          specScore += 15;
          specReason = 'Excellent: Haruan is active in light rain and warm drizzles!';
        } else if (hour >= 6 && hour <= 9) {
          specScore += 10;
          specReason = 'Good: Ideal morning ambush feeding conditions.';
        } else if (isStorm) {
          specScore -= 20;
          specReason = 'Poor: Stiff storm fronts push Haruan into deep weed structures.';
        } else {
          specReason = 'Moderate: Standard ambush patterns under weed beds.';
        }
        break;

      case 'Toman':
        // Giant Snakehead is active in warm hours and twilight
        if (currentTemp >= 27 && currentTemp <= 32 && !isStorm) {
          specScore += 12;
          specReason = 'Excellent: Toman loves warm surface waters for hunting.';
        } else if (hour >= 16 && hour <= 19) {
          specScore += 8;
          specReason = 'Good: Late afternoon surface breathing activity.';
        } else {
          specReason = 'Moderate: Suspended pattern in structural logs.';
        }
        break;

      case 'Peacock Bass':
        // Sight predator, loves clear water, warm temperature, bright sun
        if (isSunny && !isLightRain) {
          specScore += 15;
          specReason = 'Excellent: Sight hunting sight-predator active in high glare!';
        } else if (hour >= 10 && hour <= 15) {
          specScore += 10; // Active during heat
          specReason = 'Good: High sun optimizes vision for hunting schooling fry.';
        } else {
          specReason = 'Moderate: Inactive during low light conditions.';
        }
        break;

      case 'Patin':
        // Bottom feeder, active in deep twilight, calm waters
        if (hour >= 18 || hour <= 5) {
          specScore += 15;
          specReason = 'Excellent: Patin feeds actively under low-light bottom channels.';
        } else if (isLightRain) {
          specScore += 5;
          specReason = 'Good: Runoff brings organic nutrients to bottom feeding beds.';
        } else {
          specReason = 'Moderate: Hiding in deep drop-offs and riverbed troughs.';
        }
        break;

      case 'Tilapia':
        // Active in warm, shallow vegetative structures
        if (currentTemp >= 25 && currentTemp <= 30) {
          specScore += 8;
          specReason = 'Good: Active feeding on aquatic vegetation.';
        } else {
          specReason = 'Moderate: Schooling in shallow thermal pockets.';
        }
        break;
    }

    // Clamp species score
    specScore = Math.max(10, Math.min(100, specScore));

    return {
      species,
      score: specScore,
      label: getLabel(specScore),
      reason: specReason,
    };
  });

  return {
    overallScore: finalScore,
    overallLabel,
    speciesBreakdown,
    astronomicalInfluence: astroNote,
    weatherInfluence: weatherNote,
  };
}
