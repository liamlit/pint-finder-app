// src/app/venues/page.js
'use client';

import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import styles from './VenuesPage.module.css';
import { supabase } from '../../../supabaseClient'; // Verify this path is correct
import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';

// Dynamically import VenuesMap with SSR turned off
const VenuesMap = dynamic(
  () => import('@/components/VenuesMap'), // Verify this path is correct
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
        .select('*, pints(*)');

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

      if (error) {
        throw error;
      }
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <input
            type="text"
            placeholder="Filter by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px', marginRight: '10px' }}
          />
        </div>
        
        <div>
          <button onClick={() => handleSort('asc')} style={{ marginRight: '10px' }}>
            Sort Price: Low to High
          </button>
          <button onClick={() => handleSort('desc')} style={{ marginRight: '10px' }}>
            Sort Price: High to Low
          </button>
          <Link href="/venues/add" passHref>
            <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>
              + Add New Venue
            </button>
          </Link>
        </div>
      </div>

      {filteredVenues.length > 0 ? (
        <div>
          {filteredVenues.map(venue => (
            <div 
              key={venue.id} 
              className={styles.venueCard}
            >
              <div onClick={() => handleVenueSelect(venue)} style={{cursor: 'pointer'}}>
                <h2 className={styles.venueName}>{venue.name}</h2>
                <p className={styles.venueDetails}>
                  <strong>Address:</strong> {venue.address || 'N/A'}
                </p>

                {venue.pints && venue.pints.length > 0 ? (
                  <div style={{ marginTop: '10px' }}>
                    <ul style={{ listStyleType: 'none', paddingLeft: '0', margin: '0' }}>
                      {venue.pints.map(pint => (
                        <li 
                          key={pint.id} 
                          style={{ 
                            borderTop: '1px solid #eee', 
                            paddingTop: '6px', 
                            marginTop: '6px' 
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{pint.beer_name} - <strong>${pint.price.toFixed(2)}</strong></span>
                            
                            {/* Edit/Delete Buttons */}
                            <div>
                              <Link href={`/pints/${pint.id}/edit`} passHref>
                                <button 
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ 
                                    backgroundColor: '#ffc107', 
                                    color: 'black',
                                    border: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    marginRight: '5px'
                                  }}
                                >
                                  Edit
                                </button>
                              </Link>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePint(pint.id);
                                }}
                                style={{ 
                                  backgroundColor: '#dc3545', 
                                  color: 'white',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem'
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          
                          {/* Timestamp Display */}
                          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                            Updated {formatDistanceToNow(new Date(pint.updated_at || pint.created_at), { addSuffix: true })}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className={styles.venueDetails} style={{ fontStyle: 'italic', marginTop: '10px' }}>
                    No specific pint prices listed.
                  </p>
                )}
              </div>
              
              <div style={{ textAlign: 'right', marginTop: '15px' }}>
                <Link href={`/venues/${venue.id}/add-pint`} passHref>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      backgroundColor: '#17a2b8', 
                      color: 'white', 
                      border: 'none', 
                      padding: '5px 10px', 
                      borderRadius: '5px', 
                      cursor: 'pointer' 
                    }}
                  >
                    + Add Beer/Price
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p style={{ marginTop: '20px' }}>No venues match your search.</p>
      )}
    </div>
  );
}