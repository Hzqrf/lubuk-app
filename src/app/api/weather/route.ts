import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');

    if (!latStr || !lonStr) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: 'Invalid latitude or longitude' }, { status: 400 });
    }

    // Round coordinates to 2 decimal places to cache in a ~1.1km grid
    const latRounded = Math.round(lat * 100) / 100;
    const lonRounded = Math.round(lon * 100) / 100;

    // Check weather cache
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: cached, error: cacheError } = await supabase
      .from('weather_cache')
      .select('*')
      .eq('latitude', latRounded)
      .eq('longitude', lonRounded)
      .gt('created_at', oneHourAgo)
      .order('created_at', { ascending: false })
      .limit(1);

    if (cacheError) {
      console.error('Cache query error:', cacheError);
    }

    if (cached && cached.length > 0) {
      return NextResponse.json({
        data: cached[0].weather_data,
        cached: true,
        timestamp: cached[0].created_at,
      });
    }

    // Cache miss or expired - fetch from Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset,uv_index_max&timezone=auto`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Open-Meteo API returned status ${res.status}`);
    }

    const weatherData = await res.json();

    // Save back to cache
    const { error: insertError } = await supabase
      .from('weather_cache')
      .insert({
        latitude: latRounded,
        longitude: lonRounded,
        weather_data: weatherData,
      });

    if (insertError) {
      console.error('Failed to cache weather data:', insertError);
    }

    return NextResponse.json({
      data: weatherData,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Weather Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
