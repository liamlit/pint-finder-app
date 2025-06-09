// src/app/venues/page.js
'use client';

import Link from 'next/link';
import styles from './VenuesPage.module.css'; // Simplified path
import { supabase } from '../../../supabaseClient'; // Recommended path with alias
import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import VenueCard from '@/components/VenueCard'; // Recommended path with alias

// Dynamically import VenuesMap with SSR turned off
const VenuesMap = dynamic(
  () => import('@/components/VenuesMap'), // Recommended path with alias
  { 
    ssr: false,
    loading: () => <p>Loading Map...</p> 
  }
);

// Define initial default coordinates
const DEFAULT_LATITUDE = -37.840935;
const DEFAULT_LONGITUDE = 144.946457;
const DEFAULT_ZOOM = 9;
const SELECTED_VENUE_ZOOM = 15;

export default function VenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([DEFAULT_LATITUDE, DEFAULT_LONGITUDE]);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchVenues() {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('venues')
        .select('*, pints(id, beer_name, price, created_at, updated_at)');

      if (fetchError) {
        console.error('Error fetching venues:', fetchError.message);
        setError(fetchError.message);
        setVenues([]);
      } else {
        setVenues(data || []);
        if (data && data.length > 0) {
          if (mapCenter[0] === DEFAULT_LATITUDE && mapCenter[1] === DEFAULT_LONGITUDE) {
            setMapCenter([data[0].latitude || DEFAULT_LATITUDE, data[0].longitude || DEFAULT_LONGITUDE]);
            setMapZoom(13);
          }
        }
      }
      setLoading(false);
    }
    fetchVenues();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  const handleSort = (sortType) => {
    const getMinPrice = (venue) => {
      if (!venue.pints || venue.pints.length === 0) return Infinity;
      return Math.min(...venue.pints.map(pint => pint.price));
    };

    const sorted = [...venues].sort((a, b) => {
      const priceA = getMinPrice(a);
      const priceB = getMinPrice(b);
      return sortType === 'asc' ? priceA - priceB : priceB - priceA;
    });

    setVenues(sorted);
  };

  const handleVenueSelect = useCallback((venue) => {
    if (venue.latitude && venue.longitude) {
      setMapCenter([venue.latitude, venue.longitude]);
      setMapZoom(SELECTED_VENUE_ZOOM);
    }
  }, [setMapCenter, setMapZoom]);

  const handleDeletePint = async (pintIdToDelete) => {
    if (!window.confirm("Are you sure you want to delete this pint price?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pints')
        .delete()
        .eq('id', pintIdToDelete);

      if (error) { throw error; }

      setVenues(currentVenues => 
        currentVenues.map(venue => {
          const pintExistsInVenue = venue.pints.some(p => p.id === pintIdToDelete);
          if (pintExistsInVenue) {
            return {
              ...venue,
              pints: venue.pints.filter(p => p.id !== pintIdToDelete),
            };
          }
          return venue;
        })
      );
      
      console.log("Successfully deleted pint:", pintIdToDelete);

    } catch (error) {
      console.error("Error deleting pint:", error.message);
    }
  };

  const handleGeolocationSuccess = useCallback((coords) => {
    setMapCenter([coords.latitude, coords.longitude]);
    setMapZoom(13); 
  }, [setMapCenter, setMapZoom]);

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading venues...</p>;
  if (error) return <p>Error loading venues: {error}</p>;

  return (
    <div>
      <h1>PintFinder Venues</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <VenuesMap
          venues={filteredVenues}
          center={mapCenter}
          zoom={mapZoom}
          onGeolocationSuccess={handleGeolocationSuccess} 
        />
      </div>

      <div className={styles.controlsContainer}>
        <div>
          <input
            type="text"
            placeholder="Filter by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.buttonGroup}>
          <button onClick={() => handleSort('asc')} className={styles.controlButton}>
            Sort Price: Low to High
          </button>
          <button onClick={() => handleSort('desc')} className={styles.controlButton}>
            Sort Price: High to Low
          </button>
          <Link href="/venues/add" passHref>
            <button className={`${styles.controlButton} ${styles.addButton}`}>
              + Add New Venue
            </button>
          </Link>
        </div>
      </div>

      {filteredVenues.length > 0 ? (
        <div>
          {filteredVenues.map(venue => (
            <VenueCard 
              key={venue.id}
              venue={venue} 
              onVenueSelect={handleVenueSelect}
              onDeletePint={handleDeletePint} 
            />
          ))}
        </div>
      ) : (
        !loading && <p style={{ marginTop: '20px' }}>No venues match your search.</p>
      )}
    </div>
  );
}