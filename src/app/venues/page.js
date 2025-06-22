// src/app/venues/page.js
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react'; // <-- 1. IMPORT useMemo
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '../../../supabaseClient'; 
import styles from './VenuesPage.module.css';
import VenueCard from '@/components/VenueCard'; 


const VenuesMap = dynamic(() => import('@/components/VenuesMap'), { ssr: false, loading: () => <p>Loading Map...</p> });

// ... (your constants like DEFAULT_LATITUDE, etc. remain the same) ...
const DEFAULT_LATITUDE = -37.840935;
const DEFAULT_LONGITUDE = 144.946457;
const DEFAULT_ZOOM = 10;
const SELECTED_VENUE_ZOOM = 15;


export default function VenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([DEFAULT_LATITUDE, DEFAULT_LONGITUDE]);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [nameSearchTerm, setNameSearchTerm] = useState('');
  const [suburbSearchTerm, setSuburbSearchTerm] = useState('');

  useEffect(() => {
    async function fetchVenues() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('venues')
        .select('*, pints(*)');

      if (error) {
        console.error('Error fetching venues:', error.message);
        setError(error.message);
      } else {
        setVenues(data || []);
      }
      setLoading(false);
    }
    fetchVenues();
  }, []); 
      
  const handleSort = () => {
    const sortedVenues = [...venues].sort((a, b) => {
      const getCheapestPrice = (venue) => {
        if (!venue.pints || venue.pints.length === 0) return Infinity;
        return Math.min(...venue.pints.map(p => p.price));
      };
      return getCheapestPrice(a) - getCheapestPrice(b);
    });
    setVenues(sortedVenues);
  };

  const handleVenueSelect = useCallback((venue) => {
    if (venue && venue.latitude && venue.longitude) {
      setMapCenter([venue.latitude, venue.longitude]);
      setMapZoom(SELECTED_VENUE_ZOOM);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleDeleteVenue = async (venueIdToDelete) => {
    if (!window.confirm("Are you sure you want to delete this venue and all its pints?")) return;
    try {
      const { error } = await supabase.from('venues').delete().eq('id', venueIdToDelete);
      if (error) throw error;
      setVenues(currentVenues => currentVenues.filter(venue => venue.id !== venueIdToDelete));
      alert("Venue deleted successfully!");
    } catch (error) {
      console.error('Error deleting venue:', error);
      alert(`Error deleting venue: ${error.message}`);
    }
  };


  const handleDeletePint = async (pintIdToDelete) => {
    if (!window.confirm("Are you sure you want to delete this pint?")) return;
    try {
      const { error } = await supabase.from('pints').delete().eq('id', pintIdToDelete);
      if (error) throw error;
      setVenues(currentVenues => currentVenues.map(venue => ({
          ...venue,
          pints: venue.pints.filter(p => p.id !== pintIdToDelete)
      })));
      alert("Pint deleted successfully!");
    } catch (error) {
      console.error('Error deleting pint:', error);
      alert(`Error deleting pint: ${error.message}`);
    }
  };

  const handleGeolocationSuccess = useCallback((coords) => {
    setMapCenter([coords.latitude, coords.longitude]);
    setMapZoom(14);
  }, []);

  const filteredVenues = venues.filter(venue => {
    const nameMatch = venue.name.toLowerCase().includes(nameSearchTerm.toLowerCase());
    const suburbMatch = venue.suburb ? venue.suburb.toLowerCase().includes(suburbSearchTerm.toLowerCase()) : true;
    return nameMatch && suburbMatch;
  });


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
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', minWidth: '200px'}}>
          <input
            type="text"
            placeholder="Filter by name..."
            value={nameSearchTerm}
            onChange={(e) => setNameSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
           <input
            type="text"
            placeholder="Filter by suburb..."
            value={suburbSearchTerm}
            onChange={(e) => setSuburbSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.buttonGroup}>
          <button onClick={handleSort} className={styles.controlButton}>
            Sort by Price
          </button>
          <Link href="/venues/add" passHref>
            <button className={`${styles.controlButton} ${styles.primary}`}>
              + Add Venue
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
              onDeleteVenue={handleDeleteVenue}
            />
          ))}
        </div>
      ) : (
        !loading && <p style={{ marginTop: '20px' }}>No venues match your search.</p>
      )}
    </div>
  );
}