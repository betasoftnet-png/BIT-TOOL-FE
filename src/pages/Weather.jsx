// import React, { useState, useEffect } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { Sun, Moon, Cloud, CloudRain, Wind, Droplets, MapPin, Loader2, Sunrise, Sunset, Thermometer, Calendar } from 'lucide-react';
// import { motion } from 'framer-motion';

// export default function Weather() {
//   const [coords, setCoords] = useState(null);
//   const [geoError, setGeoError] = useState(null);

//   useEffect(() => {
//     if ('geolocation' in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setCoords({
//             lat: position.coords.latitude,
//             lon: position.coords.longitude
//           });
//         },
//         (error) => {
//           console.error("Geolocation error:", error);
//           setGeoError(error.message);
//         }
//       );
//     } else {
//       setGeoError("Geolocation is not supported by your browser");
//     }
//   }, []);

//   const fetchWeather = async () => {
//     if (!coords) return null;
//     const { lat, lon } = coords;
//     const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m&current=temperature_2m,is_day,relative_humidity_2m,wind_speed_10m&timezone=auto`;
//     const response = await fetch(url);
//     if (!response.ok) throw new Error("Failed to fetch weather data");
//     return response.json();
//   };

//   const { data, isLoading, error } = useQuery({
//     queryKey: ['weather', coords?.lat, coords?.lon],
//     queryFn: fetchWeather,
//     enabled: !!coords,
//   });

//   const getWeatherIcon = (isDay, size = 24, className = "") => {
//     return isDay ? <Sun size={size} className={`text-yellow-400 ${className}`} /> : <Moon size={size} className={`text-blue-300 ${className}`} />;
//   };

//   const formatTime = (isoString) => {
//     if (!isoString) return '';
//     const date = new Date(isoString);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const formatDay = (isoString) => {
//     if (!isoString) return '';
//     const date = new Date(isoString);
//     if (new Date().toDateString() === date.toDateString()) return 'Today';
//     return date.toLocaleDateString([], { weekday: 'short' });
//   };

//   return (
//     <div className="min-h-full bg-gradient-to-br from-indigo-50 to-blue-100 p-4 md:p-8 rounded-3xl">
//       <div className="max-w-5xl mx-auto space-y-8">
        
//         {/* Header */}
//         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
//               <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/30">
//                 <CloudRain size={28} />
//               </div>
//               Weather Forecast
//             </h1>
//             <p className="text-gray-500 mt-2 text-sm md:text-base font-medium flex items-center gap-1.5">
//               <MapPin size={16} className="text-blue-500" /> 
//               {coords ? `Lat: ${coords.lat.toFixed(2)}, Lon: ${coords.lon.toFixed(2)}` : 'Locating...'}
//             </p>
//           </div>
//         </div>

//         {/* Status / Loading / Error */}
//         {!coords && !geoError && (
//           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center p-12 bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-xl">
//             <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
//             <h3 className="text-lg font-bold text-gray-800">Determining your location...</h3>
//             <p className="text-gray-500 text-sm mt-1 text-center">Please allow location access in your browser.</p>
//           </motion.div>
//         )}

//         {geoError && (
//           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-red-50 border-l-4 border-red-500 rounded-r-2xl shadow-sm">
//             <h3 className="text-lg font-bold text-red-800">Location Error</h3>
//             <p className="text-red-600 mt-1">{geoError}</p>
//           </motion.div>
//         )}

//         {isLoading && coords && (
//           <div className="flex justify-center p-12">
//             <Loader2 size={40} className="animate-spin text-blue-500" />
//           </div>
//         )}

//         {error && (
//           <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-r-2xl shadow-sm">
//             <h3 className="text-lg font-bold text-red-800">Failed to fetch weather data</h3>
//             <p className="text-red-600 mt-1">{error.message}</p>
//           </div>
//         )}

//         {/* Dashboard */}
//         {data && data.current && (
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }} 
//             animate={{ opacity: 1, y: 0 }} 
//             className="grid grid-cols-1 lg:grid-cols-3 gap-6"
//           >
//             {/* Current Weather Main Card */}
//             <div className={`col-span-1 lg:col-span-2 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl transition-colors duration-1000 ${data.current.is_day ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-indigo-900 to-blue-900'}`}>
//               {/* Abstract background blobs */}
//               <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
//               <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

//               <div className="relative z-10 flex flex-col h-full justify-between">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h2 className="text-2xl font-bold opacity-90">Current Weather</h2>
//                     <p className="opacity-75 font-medium">{formatDay(new Date().toISOString())}, {formatTime(new Date().toISOString())}</p>
//                   </div>
//                   {getWeatherIcon(data.current.is_day, 64, "drop-shadow-lg")}
//                 </div>

//                 <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
//                   <div className="flex items-start gap-2">
//                     <span className="text-7xl md:text-8xl font-black tracking-tighter drop-shadow-md">
//                       {Math.round(data.current.temperature_2m)}°
//                     </span>
//                   </div>

//                   <div className="flex flex-row sm:flex-col gap-4 sm:gap-2">
//                     <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl backdrop-blur-sm">
//                       <Wind size={18} className="opacity-80" />
//                       <span className="font-semibold">{data.current.wind_speed_10m} km/h</span>
//                     </div>
//                     <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl backdrop-blur-sm">
//                       <Droplets size={18} className="opacity-80" />
//                       <span className="font-semibold">{data.current.relative_humidity_2m}%</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Today's Sun / Info Card */}
//             <div className="col-span-1 bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-xl flex flex-col gap-6">
//               <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
//                 <Thermometer size={20} className="text-orange-500" /> 
//                 Today's Summary
//               </h3>
              
//               <div className="grid grid-cols-2 gap-4 flex-1">
//                 <div className="bg-orange-50 rounded-2xl p-4 flex flex-col justify-center items-center text-center gap-2 border border-orange-100">
//                   <Sunrise size={28} className="text-orange-500" />
//                   <div>
//                     <p className="text-xs text-orange-600/80 font-bold uppercase tracking-wider">Sunrise</p>
//                     <p className="text-lg font-black text-orange-900">{formatTime(data.daily.sunrise[0])}</p>
//                   </div>
//                 </div>
//                 <div className="bg-indigo-50 rounded-2xl p-4 flex flex-col justify-center items-center text-center gap-2 border border-indigo-100">
//                   <Sunset size={28} className="text-indigo-500" />
//                   <div>
//                     <p className="text-xs text-indigo-600/80 font-bold uppercase tracking-wider">Sunset</p>
//                     <p className="text-lg font-black text-indigo-900">{formatTime(data.daily.sunset[0])}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
//                 <div className="text-center">
//                   <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Min</p>
//                   <p className="text-xl font-black text-blue-600">{Math.round(data.daily.temperature_2m_min[0])}°</p>
//                 </div>
//                 <div className="w-px h-8 bg-gray-200"></div>
//                 <div className="text-center">
//                   <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Max</p>
//                   <p className="text-xl font-black text-red-500">{Math.round(data.daily.temperature_2m_max[0])}°</p>
//                 </div>
//               </div>
//             </div>

//             {/* Hourly Forecast */}
//             <div className="col-span-1 lg:col-span-3 bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-xl">
//               <div className="flex items-center gap-2 mb-6">
//                 <Clock size={20} className="text-blue-500" />
//                 <h3 className="text-lg font-bold text-gray-800">Hourly Forecast</h3>
//               </div>
              
//               <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
//                 {data.hourly.time.slice(0, 24).map((time, idx) => {
//                   // Find current hour index to only show upcoming hours (or just show first 24)
//                   // For simplicity, we just slice the first 24 hours of the array
//                   const date = new Date(time);
//                   const isNow = idx === new Date().getHours() && date.getDate() === new Date().getDate();
//                   const temp = Math.round(data.hourly.temperature_2m[idx]);
//                   const hourIsDay = date.getHours() >= 6 && date.getHours() < 18; // rough estimate for icons
                  
//                   return (
//                     <motion.div 
//                       key={time} 
//                       whileHover={{ scale: 1.05, y: -5 }}
//                       className={`flex flex-col items-center justify-between min-w-[80px] p-4 rounded-2xl shrink-0 transition-colors shadow-sm border ${isNow ? 'bg-blue-500 text-white border-blue-600 shadow-blue-500/30' : 'bg-white border-gray-100 hover:border-blue-200'}`}
//                     >
//                       <p className={`text-sm font-bold ${isNow ? 'text-white' : 'text-gray-500'}`}>{isNow ? 'Now' : formatTime(time)}</p>
//                       <div className="my-3">
//                         {getWeatherIcon(hourIsDay, 28, isNow ? 'text-white' : '')}
//                       </div>
//                       <p className={`text-xl font-black ${isNow ? 'text-white' : 'text-gray-900'}`}>{temp}°</p>
//                     </motion.div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* 7-Day Forecast */}
//             <div className="col-span-1 lg:col-span-3 bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-xl">
//               <div className="flex items-center gap-2 mb-6">
//                 <Calendar size={20} className="text-blue-500" />
//                 <h3 className="text-lg font-bold text-gray-800">7-Day Forecast</h3>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
//                 {data.daily.time.map((time, idx) => {
//                   const maxT = Math.round(data.daily.temperature_2m_max[idx]);
//                   const minT = Math.round(data.daily.temperature_2m_min[idx]);
//                   return (
//                     <motion.div 
//                       key={time}
//                       whileHover={{ scale: 1.02 }}
//                       className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between items-center gap-3"
//                     >
//                       <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{formatDay(time)}</p>
                      
//                       <div className="flex items-center gap-3 w-full justify-center">
//                         <span className="text-lg font-black text-blue-600">{minT}°</span>
//                         <div className="h-1 w-8 bg-gradient-to-r from-blue-400 to-red-400 rounded-full"></div>
//                         <span className="text-lg font-black text-red-500">{maxT}°</span>
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//               </div>
//             </div>

//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }






import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sun,
  Moon,
  CloudRain,
  Wind,
  Droplets,
  MapPin,
  Loader2,
  Sunrise,
  Sunset,
  Thermometer,
  Calendar,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Weather() {
  const [coords, setCoords] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Get user's location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        console.log('User location:', {
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
        });

        setCoords({
          lat: latitude,
          lon: longitude,
        });

        setGeoError(null);
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', {
          code: error.code,
          message: error.message,
        });

        setIsLocating(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError(
              'Location permission was denied. Please allow location access for this website in your browser settings.'
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setGeoError(
              'Your current location is temporarily unavailable. Please check your device Location Services and try again.'
            );
            break;

          case error.TIMEOUT:
            setGeoError(
              'The location request timed out. Please try again.'
            );
            break;

          default:
            setGeoError(
              'Unable to determine your current location. Please try again.'
            );
        }
      },
      {
        // Weather does not require GPS-level accuracy.
        // This also helps avoid CoreLocation issues caused by
        // trying to obtain a high-accuracy location.
        enableHighAccuracy: false,

        // Give CoreLocation enough time to obtain a location.
        timeout: 15000,

        // Allow a recent cached location for 5 minutes.
        maximumAge: 300000,
      }
    );
  }, []);

  // Get location when component loads
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Fetch weather from Open-Meteo
  const fetchWeather = async () => {
    if (!coords) return null;

    const { lat, lon } = coords;

    const url =
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${lat}` +
      `&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset` +
      `&hourly=temperature_2m` +
      `&current=temperature_2m,is_day,relative_humidity_2m,wind_speed_10m` +
      `&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    return response.json();
  };

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['weather', coords?.lat, coords?.lon],
    queryFn: fetchWeather,
    enabled: !!coords,
  });

  const fetchLocationName = async () => {
    if (!coords) return null;
    const { lat, lon } = coords;
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch location name');
    return response.json();
  };

  const { data: locationData, isLoading: isLocationLoading } = useQuery({
    queryKey: ['locationName', coords?.lat, coords?.lon],
    queryFn: fetchLocationName,
    enabled: !!coords,
  });

  // Weather icon
  const getWeatherIcon = (
    isDay,
    size = 24,
    className = ''
  ) => {
    return isDay ? (
      <Sun
        size={size}
        className={`text-yellow-400 ${className}`}
      />
    ) : (
      <Moon
        size={size}
        className={`text-blue-300 ${className}`}
      />
    );
  };

  // Format time
  const formatTime = (isoString) => {
    if (!isoString) return '';

    const date = new Date(isoString);

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format day
  const formatDay = (isoString) => {
    if (!isoString) return '';

    const date = new Date(isoString);

    if (
      new Date().toDateString() === date.toDateString()
    ) {
      return 'Today';
    }

    return date.toLocaleDateString([], {
      weekday: 'short',
    });
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 rounded-3xl transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors">
              <div className="p-3 bg-blue-500 dark:bg-blue-900/40 text-white dark:text-blue-400 rounded-2xl shadow-lg shadow-blue-500/30 dark:shadow-none transition-colors">
                <CloudRain size={28} />
              </div>

              Weather Forecast
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base font-medium flex items-center gap-1.5 transition-colors">
              <MapPin size={16} className="text-blue-500" />

              {coords
                ? isLocationLoading
                  ? 'Determining location name...'
                  : locationData
                    ? `${locationData.city || locationData.locality}, ${locationData.principalSubdivision}`
                    : `Lat: ${coords.lat.toFixed(4)}, Lon: ${coords.lon.toFixed(4)}`
                : isLocating
                  ? 'Locating...'
                  : 'Location unavailable'}
            </p>
          </div>
        </div>

        {/* Location Loading */}
        {!coords && !geoError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-3xl border border-white dark:border-gray-700 shadow-xl transition-colors"
          >
            <Loader2
              size={40}
              className="animate-spin text-blue-500 mb-4"
            />

            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 transition-colors">
              Determining your location...
            </h3>

            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 text-center transition-colors">
              Please allow location access in your browser.
            </p>
          </motion.div>
        )}

        {/* Location Error */}
        {geoError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-800 rounded-r-2xl shadow-sm transition-colors"
          >
            <h3 className="text-lg font-bold text-red-800 dark:text-red-400 transition-colors">
              Location Error
            </h3>

            <p className="text-red-600 dark:text-red-300 mt-1 transition-colors">
              {geoError}
            </p>

            <button
              onClick={getUserLocation}
              disabled={isLocating}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-xl transition-colors"
            >
              {isLocating && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )}

              {isLocating
                ? 'Trying...'
                : 'Try Again'}
            </button>
          </motion.div>
        )}

        {/* Weather Loading */}
        {isLoading && coords && (
          <div className="flex justify-center p-12">
            <Loader2
              size={40}
              className="animate-spin text-blue-500"
            />
          </div>
        )}

        {/* Weather API Error */}
        {error && (
          <div className="p-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-800 rounded-r-2xl shadow-sm transition-colors">
            <h3 className="text-lg font-bold text-red-800 dark:text-red-400 transition-colors">
              Failed to fetch weather data
            </h3>

            <p className="text-red-600 dark:text-red-300 mt-1 transition-colors">
              {error.message}
            </p>
          </div>
        )}

        {/* Dashboard */}
        {data && data.current && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >

            {/* Current Weather */}
            <div
              className={`col-span-1 lg:col-span-2 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl transition-colors duration-1000 ${
                data.current.is_day
                  ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                  : 'bg-gradient-to-br from-indigo-900 to-blue-900'
              }`}
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

              <div className="relative z-10 flex flex-col h-full justify-between">

                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold opacity-90">
                      Current Weather
                    </h2>

                    <p className="opacity-75 font-medium">
                      {formatDay(new Date().toISOString())},{' '}
                      {formatTime(new Date().toISOString())}
                    </p>
                  </div>

                  {getWeatherIcon(
                    data.current.is_day,
                    64,
                    'drop-shadow-lg'
                  )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">

                  <div className="flex items-start gap-2">
                    <span className="text-7xl md:text-8xl font-black tracking-tighter drop-shadow-md">
                      {Math.round(
                        data.current.temperature_2m
                      )}
                      °
                    </span>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-4 sm:gap-2">

                    <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                      <Wind
                        size={18}
                        className="opacity-80"
                      />

                      <span className="font-semibold">
                        {data.current.wind_speed_10m} km/h
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                      <Droplets
                        size={18}
                        className="opacity-80"
                      />

                      <span className="font-semibold">
                        {data.current.relative_humidity_2m}%
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Today's Summary */}
            <div className="col-span-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 border border-white dark:border-gray-700 shadow-xl flex flex-col gap-6 transition-colors">

              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                <Thermometer
                  size={20}
                  className="text-orange-500"
                />

                Today's Summary
              </h3>

              <div className="grid grid-cols-2 gap-4 flex-1">

                <div className="bg-orange-50 dark:bg-orange-900/30 rounded-2xl p-4 flex flex-col justify-center items-center text-center gap-2 border border-orange-100 dark:border-orange-800/50 transition-colors">

                  <Sunrise
                    size={28}
                    className="text-orange-500"
                  />

                  <div>
                    <p className="text-xs text-orange-600/80 dark:text-orange-400/80 font-bold uppercase tracking-wider transition-colors">
                      Sunrise
                    </p>

                    <p className="text-lg font-black text-orange-900 dark:text-orange-400 transition-colors">
                      {formatTime(
                        data.daily.sunrise[0]
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl p-4 flex flex-col justify-center items-center text-center gap-2 border border-indigo-100 dark:border-indigo-800/50 transition-colors">

                  <Sunset
                    size={28}
                    className="text-indigo-500"
                  />

                  <div>
                    <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 font-bold uppercase tracking-wider transition-colors">
                      Sunset
                    </p>

                    <p className="text-lg font-black text-indigo-900 dark:text-indigo-400 transition-colors">
                      {formatTime(
                        data.daily.sunset[0]
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-gray-900/50 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">

                <div className="text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1 transition-colors">
                    Min
                  </p>

                  <p className="text-xl font-black text-blue-600">
                    {Math.round(
                      data.daily.temperature_2m_min[0]
                    )}
                    °
                  </p>
                </div>

                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 transition-colors"></div>

                <div className="text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1 transition-colors">
                    Max
                  </p>

                  <p className="text-xl font-black text-red-500">
                    {Math.round(
                      data.daily.temperature_2m_max[0]
                    )}
                    °
                  </p>
                </div>

              </div>
            </div>

            {/* Hourly Forecast */}
            <div className="col-span-1 lg:col-span-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 border border-white dark:border-gray-700 shadow-xl transition-colors">

              <div className="flex items-center gap-2 mb-6">
                <Clock
                  size={20}
                  className="text-blue-500"
                />

                <h3 className="text-lg font-bold text-gray-800 dark:text-white transition-colors">
                  Hourly Forecast
                </h3>
              </div>

              <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">

                {data.hourly.time
                  .slice(0, 24)
                  .map((time, idx) => {

                    const date = new Date(time);

                    const isNow =
                      idx === new Date().getHours() &&
                      date.getDate() ===
                        new Date().getDate();

                    const temp = Math.round(
                      data.hourly.temperature_2m[idx]
                    );

                    const hourIsDay =
                      date.getHours() >= 6 &&
                      date.getHours() < 18;

                    return (
                      <motion.div
                        key={time}
                        whileHover={{
                          scale: 1.05,
                          y: -5,
                        }}
                        className={`flex flex-col items-center justify-between min-w-[80px] p-4 rounded-2xl shrink-0 transition-colors shadow-sm border ${
                          isNow
                            ? 'bg-blue-500 text-white border-blue-600 shadow-blue-500/30'
                            : 'bg-white dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-gray-700'
                        }`}
                      >

                        <p
                          className={`text-sm font-bold transition-colors ${
                            isNow
                              ? 'text-white'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {isNow
                            ? 'Now'
                            : formatTime(time)}
                        </p>

                        <div className="my-3">
                          {getWeatherIcon(
                            hourIsDay,
                            28,
                            isNow
                              ? 'text-white'
                              : ''
                          )}
                        </div>

                        <p
                          className={`text-xl font-black transition-colors ${
                            isNow
                              ? 'text-white'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {temp}°
                        </p>

                      </motion.div>
                    );
                  })}
              </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="col-span-1 lg:col-span-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 border border-white dark:border-gray-700 shadow-xl transition-colors">

              <div className="flex items-center gap-2 mb-6">
                <Calendar
                  size={20}
                  className="text-blue-500"
                />

                <h3 className="text-lg font-bold text-gray-800 dark:text-white transition-colors">
                  7-Day Forecast
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">

                {data.daily.time.map(
                  (time, idx) => {

                    const maxT = Math.round(
                      data.daily
                        .temperature_2m_max[idx]
                    );

                    const minT = Math.round(
                      data.daily
                        .temperature_2m_min[idx]
                    );

                    return (
                      <motion.div
                        key={time}
                        whileHover={{
                          scale: 1.02,
                        }}
                        className="bg-white dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between items-center gap-3 transition-colors"
                      >

                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                          {formatDay(time)}
                        </p>

                        <div className="flex items-center gap-3 w-full justify-center">

                          <span className="text-lg font-black text-blue-600">
                            {minT}°
                          </span>

                          <div className="h-1 w-8 bg-gradient-to-r from-blue-400 to-red-400 rounded-full"></div>

                          <span className="text-lg font-black text-red-500">
                            {maxT}°
                          </span>

                        </div>

                      </motion.div>
                    );
                  }
                )}

              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}