// src/app/venues/page.js
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react'; // <-- 1. IMPORT useMemo
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '../../../supabaseClient'; 
import styles from './VenuesPage.module.css';
import VenueCard from '@/components/VenueCard'; 
import Select from 'react-select'; // <-- 2. IMPORT react-select

const VenuesMap = dynamic(() => import('@/components/VenuesMap'), { ssr: false, loading: () => <p>Loading Map...</p> });

// ... (your constants like DEFAULT_LATITUDE, etc. remain the same) ...
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
  const [suburbs, setSuburbs] = useState([]);
  const [selectedSuburb, setSelectedSuburb] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      const [venuesResponse, suburbsResponse] = await Promise.all([
        supabase.from('venues').select('*, pints(*)'),
        supabase.from('distinct_suburbs').select('suburb')
      ]);

      if (venuesResponse.error) {
        console.error('Error fetching venues:', venuesResponse.error.message);
        setError(venuesResponse.error.message);
      } else {
        setVenues(venuesResponse.data || []);
        // ... (logic to set initial map center)
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


  // --- 3. PREPARE DATA FOR react-select ---
  // react-select expects options in the format: { value: 'suburb', label: 'Suburb' }
  const suburbOptions = useMemo(() => 
    suburbs.map(s => ({ value: s.suburb, label: s.suburb })),
    [suburbs]
  );
  // --- END ---

  const filteredVenues = venues.filter(venue => {
    const nameMatch = venue.name.toLowerCase().includes(searchTerm.toLowerCase());
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
          venues={filteredVenues}
          center={mapCenter}
          zoom={mapZoom}
          onGeolocationSuccess={handleGeolocationSuccess} 
        />
      </div>

      {/* --- 4. REPLACE <select> WITH <Select> COMPONENT --- */}
      <div className={styles.controlsContainer}>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', minWidth: '200px'}}>
          <input
            type="text"
            placeholder="Filter by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {/* Using the new searchable Select component */}
          <Select 
            instanceId="suburb-select" // Important for SSR and accessibility
            options={suburbOptions}
            onChange={(selectedOption) => setSelectedSuburb(selectedOption ? selectedOption.value : '')}
            value={suburbOptions.find(option => option.value === selectedSuburb)}
            placeholder="Search or select a suburb..."
            isClearable
            styles={{
              container: (base) => ({
                ...base,
                flex: 1,
                minWidth: '200px',
              }),
            }}
          />
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
      {/* --- END REPLACEMENT --- */}

      {/* ... (Your existing venues list rendering logic remains the same) ... */}
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