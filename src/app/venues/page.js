// src/app/venues/page.js (or app/venues/page.js)
'use client';

import { useState, useEffect } from 'react';
// Ensure this path correctly points to your supabaseClient.js file!
import { supabase } from '../../../supabaseClient'; 
// Example: import { supabase } from '../../lib/supabaseClient'; 

export default function VenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVenues() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('venues')
        .select('*');

      if (fetchError) {
        console.error('Error fetching venues:', fetchError.message);
        setError(fetchError.message);
        setVenues([]);
      } else {
        setVenues(data || []);
      }
      setLoading(false);
    }

    fetchVenues();
  }, []);

  if (loading) {
    return <p>Loading venues...</p>;
  }

  if (error) {
    return <p>Error loading venues: {error}</p>;
  }

  if (!venues.length) {
    return <p>No venues found. Add some to your Supabase table!</p>;
  }

  return (
    <div>
      <h1>PintFinder Venues</h1>
      <ul>
        {venues.map(venue => (
          <li key={venue.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h2>{venue.name}</h2>
            <p><strong>Address:</strong> {venue.address || 'N/A'}</p>
            <p><strong>Price (numeric):</strong> {venue.price_value !== null ? venue.price_value : 'N/A'}</p>
            <p><small>Latitude: {venue.latitude}, Longitude: {venue.longitude}</small></p>
          </li>
        ))}
      </ul>
    </div>
  );
}