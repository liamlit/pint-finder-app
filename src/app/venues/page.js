// src/app/venues/page.js
'use client';

import Link from 'next/link';
import styles from '../venues/VenuesPage.module.css'; // Add this import
import { supabase } from '../../../supabaseClient'; // Verify this path
import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react'; // ADD useCallback HERE

// Dynamically import VenuesMap with SSR turned off
const VenuesMap = dynamic(
  () => import('@/components/VenuesMap'), // Verify this path
  { 
    ssr: false,
    loading: () => <p>Loading Map...</p> 
  }
);

// Define initial default coordinates (e.g., Melbourne)
const DEFAULT_LATITUDE = -37.840935;
const DEFAULT_LONGITUDE = 144.946457;
const DEFAULT_ZOOM = 9;
const SELECTED_VENUE_ZOOM = 15; // Zoom level when a venue is selected

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
        .select('*');

      if (fetchError) {
        console.error('Error fetching venues:', fetchError.message);
        setError(fetchError.message);
        setVenues([]);
      } else {
        setVenues(data || []);
        // Set initial map center based on first venue if venues exist
        // and if the map hasn't been centered by another action yet (e.g. geolocation)
        if (data && data.length > 0) {
          // Check if mapCenter is still the absolute default before overriding
          if (mapCenter[0] === DEFAULT_LATITUDE && mapCenter[1] === DEFAULT_LONGITUDE) {
            setMapCenter([data[0].latitude || DEFAULT_LATITUDE, data[0].longitude || DEFAULT_LONGITUDE]);
            setMapZoom(13); // A bit more zoomed in if there are venues
          }
        }
      }
      setLoading(false);
    }
    fetchVenues();
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, []); // We only want to fetch venues once on mount. mapCenter is managed separately.


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

  // Handler for when a venue is selected from the list
  const handleVenueSelect = (venue) => {
    if (venue.latitude && venue.longitude) {
      console.log('VenuesPage: handleVenueSelect called for:', venue.name); // Log which venue
      const newCenter = [venue.latitude, venue.longitude];
      const newZoom = SELECTED_VENUE_ZOOM;
      console.log('VenuesPage: Setting mapCenter to:', newCenter, 'and mapZoom to:', newZoom);
      setMapCenter(newCenter);
      setMapZoom(newZoom);
    } else {
      console.log('VenuesPage: handleVenueSelect called for venue with missing coordinates:', venue.name);
    }
  };

  // Handler for when geolocation is successful in VenuesMap
  const handleGeolocationSuccess = useCallback((coords) => {
    console.log('VenuesPage: Geolocation success, new coords:', coords);
    setMapCenter([coords.latitude, coords.longitude]);
    setMapZoom(13); 
  }, [setMapCenter, setMapZoom]);

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('VenuesPage rendering. mapCenter:', mapCenter, 'mapZoom:', mapZoom);

  if (loading) {
    return <p>Loading venues...</p>;
  }

  if (error) {
    return <p>Error loading venues: {error}</p>;
  }

  return (
    <div>
      <h1>PintFinder Venues</h1>
      {/* ... (Your subtitle if you have one) ... */}
      
      <div style={{ marginBottom: '20px' }}>
        <VenuesMap
          venues={filteredVenues} // <-- Pass the filtered list to the map!
          center={mapCenter}
          zoom={mapZoom}
          onGeolocationSuccess={handleGeolocationSuccess} 
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        {/* --- ADD SEARCH INPUT --- */}
        <div>
          <input
            type="text"
            placeholder="Filter by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px', marginRight: '10px' }}
          />
        </div>
        
        {/* --- Buttons Group --- */}
        <div>
          <button onClick={() => handleSort('asc')} style={{ marginRight: '10px' }}>
            Sort Price: Low to High
          </button>
          <button onClick={() => handleSort('desc')} style={{ marginRight: '10px' }}>
            Sort Price: High to Low
          </button>
          {/* --- ADD THE LINK/BUTTON --- */}
          <Link href="/venues/add" passHref>
            <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>
              + Add New Venue
            </button>
          </Link>
        </div>
      </div>

      {filteredVenues.length > 0 ? ( // <-- Use filteredVenues here
        <div className={styles.venueListContainer}> {/* Using a class for potential future styling */}
          {/* <-- 4. MAP OVER FILTERED LIST --> */}
          {filteredVenues.map(venue => (
            <div 
              key={venue.id} 
              className={styles.venueCard}
              onClick={() => handleVenueSelect(venue)}
            >
              <h2 className={styles.venueName}>{venue.name}</h2>
              <p className={styles.venueDetails}>
                <strong>Address:</strong> {venue.address || 'N/A'}
              </p>
              <p className={styles.venueDetails}>
                <strong>Price (numeric):</strong> {venue.price_value !== null ? venue.price_value : 'N/A'}
              </p>
              {/* Coordinates are optional in the card view now */}
            </div>
          ))}
        </div>
      ) : (
        !loading && <p style={{ marginTop: '20px' }}>No venues match your search.</p>
      )}
    </div>
  );
}