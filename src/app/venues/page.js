// src/app/venues/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '../../../supabaseClient'; // Verify path
import styles from './VenuesPage.module.css';
import VenueCard from '@/components/VenueCard'; // Verify path

const VenuesMap = dynamic(() => import('@/components/VenuesMap'), { ssr: false, loading: () => <p>Loading Map...</p> });

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
  
  // --- NEW STATE FOR SUBURB FILTER ---
  const [suburbs, setSuburbs] = useState([]);
  const [selectedSuburb, setSelectedSuburb] = useState(''); // Empty string means "All"

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      // Fetch both venues and the list of unique suburbs concurrently
      const [venuesResponse, suburbsResponse] = await Promise.all([
        supabase.from('venues').select('*, pints(*)'),
        supabase.from('distinct_suburbs').select('suburb') // Fetch from our new view
      ]);

      if (venuesResponse.error) {
        console.error('Error fetching venues:', venuesResponse.error.message);
        setError(venuesResponse.error.message);
      } else {
        const data = venuesResponse.data || [];
        setVenues(data);
        if (data.length > 0) {
          if (mapCenter[0] === DEFAULT_LATITUDE && mapCenter[1] === DEFAULT_LONGITUDE) {
            setMapCenter([data[0].latitude || DEFAULT_LATITUDE, data[0].longitude || DEFAULT_LONGITUDE]);
            setMapZoom(13);
          }
        }
      }
      
      if (suburbsResponse.error) {
        console.error('Error fetching suburbs:', suburbsResponse.error.message);
      } else {
        setSuburbs(suburbsResponse.data || []);
      }

      setLoading(false);
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // ... (handleSort, handleVenueSelect, handleDeletePint, handleGeolocationSuccess functions remain the same) ...
  const handleSort = (sortType) => { /* ... no changes here ... */ };
  const handleVenueSelect = useCallback((venue) => { /* ... no changes here ... */ }, [setMapCenter, setMapZoom]);
  const handleDeletePint = async (pintIdToDelete) => { /* ... no changes here ... */ };
  const handleGeolocationSuccess = useCallback((coords) => { /* ... no changes here ... */ }, [setMapCenter, setMapZoom]);

  // --- MODIFIED: Update filtering logic to include suburb ---
  const filteredVenues = venues.filter(venue => {
    const nameMatch = venue.name.toLowerCase().includes(searchTerm.toLowerCase());
    // If a suburb is selected, check for a match. If "All" is selected, this check passes.
    const suburbMatch = selectedSuburb ? venue.suburb === selectedSuburb : true; 
    return nameMatch && suburbMatch;
  });

  if (loading) return <p>Loading venues...</p>;
  if (error) return <p>Error loading venues: {error}</p>;

  return (
    <div>
      <h1>PintFinder Venues</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <VenuesMap
          venues={filteredVenues} // Pass filtered venues to map
          center={mapCenter}
          zoom={mapZoom}
          onGeolocationSuccess={handleGeolocationSuccess} 
        />
      </div>

      {/* --- MODIFIED: Add the suburb dropdown to the controls --- */}
      <div className={styles.controlsContainer}>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <input
            type="text"
            placeholder="Filter by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <select 
            value={selectedSuburb}
            onChange={(e) => setSelectedSuburb(e.target.value)}
            className={styles.searchInput} // Can reuse the search input style
          >
            <option value="">All Suburbs</option>
            {suburbs.map(s => (
              <option key={s.suburb} value={s.suburb}>{s.suburb}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.buttonGroup}>
          <button onClick={() => handleSort('asc')} className={styles.controlButton}>
            Sort by Price
          </button>
          <Link href="/venues/add" passHref>
            <button className={`${styles.controlButton} ${styles.primary}`}>
              + Add Venue
            </button>
          </Link>
        </div>
      </div>
      {/* --- END MODIFIED --- */}

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