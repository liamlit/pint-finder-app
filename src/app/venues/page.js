// src/app/venues/page.js (or app/venues/page.js)
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient'; 
import dynamic from 'next/dynamic';

const VenuesMap = dynamic(
    () => import('../../components/VenuesMap'),
    {
        ssr: false,
    }
);


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

  const handleSort = (sortType) => {
    const sortedVenues = [...venues].sort((a, b) => {
        if (a.price_value === null && b.price_value === null) return 0;
        if (a.price_value === null) return 1;
        if (b.price_value === null) return -1;

        if (sortType === 'asc') {
            return a.price_value - b.price_value;
          } else {
            return b.price_value - a.price_value;
          }
        });
        setVenues(sortedVenues);
  };

  if (loading) {
    return <p>Loading venues...</p>;
  }

  if (error) {
    return <p>Error loading venues: {error}</p>;
  }


  return (
    <div>
      <h1>PintFinder Venues</h1>

      <div style={{ marginBottom: '20px' }}>
        <VenuesMap venues={venues} />
      </div>

      {venues.length > 0 ? (
        <>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => handleSort('asc')} style={{ marginRight: '10px' }}>Sort Price: Low to High</button>
        <button onClick={() => handleSort('desc')}>Sort Price: High to Low</button>
    </div>    

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
      </>
      ) : (
        <p style={{ marginTop: '20px' }}>No venues to display in the list.</p>
      )}
    </div>
  );
}