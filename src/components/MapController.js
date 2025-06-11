// src/components/MapController.js
'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function MapController({ center, zoom }) {
  const map = useMap(); // This hook gives us access to the map instance

  useEffect(() => {
    // This effect runs whenever the 'center' or 'zoom' props change
    if (center && zoom) {
      map.setView(center, zoom, {
        animate: true,
        pan: {
          duration: 1, // Animation duration in seconds
        },
      });
    }
  }, [center, zoom, map]);

  // This component doesn't render any visible JSX
  return null;
}