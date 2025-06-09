// src/components/VenueCard.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import styles from './VenueCard.module.css';

export default function VenueCard({ venue, onVenueSelect, onDeletePint }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper function to find the cheapest pint
  const getCheapestPint = () => {
    if (!venue.pints || venue.pints.length === 0) {
      return null;
    }
    return [...venue.pints].sort((a, b) => a.price - b.price)[0];
  };

  const cheapestPint = getCheapestPint();

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      key={venue.id} 
      className={styles.venueCard}
    >
      {/* Main clickable area for panning the map */}
      <div onClick={() => onVenueSelect(venue)} style={{cursor: 'pointer'}}>
        <h2 className={styles.venueName}>{venue.name}</h2>
        <p className={styles.venueDetails}>
          <strong>Address:</strong> {venue.address || 'N/A'}
        </p>
      </div>
      
      {/* Pint Information Section */}
      <div style={{ marginTop: '10px' }}>
        {cheapestPint ? (
          <ul style={{ listStyleType: 'none', paddingLeft: '0', margin: '0' }}>
            
            {/* --- MODIFIED LOGIC: Always show cheapest pint WITH buttons --- */}
            <li style={{ borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  {isExpanded ? 'Cheapest: ' : 'Cheapest: '}{cheapestPint.beer_name} - <strong>${cheapestPint.price.toFixed(2)}</strong>
                </span>
                
                {/* Buttons Group for Edit and Delete */}
                <div>
                  <Link href={`/pints/${cheapestPint.id}/edit`} passHref>
                    <button onClick={(e) => e.stopPropagation()} className="mini-button">
                      Edit
                    </button>
                  </Link>
                  <button onClick={(e) => { e.stopPropagation(); onDeletePint(cheapestPint.id); }} className="mini-button-delete">
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                Updated {formatDistanceToNow(new Date(cheapestPint.updated_at || cheapestPint.created_at), { addSuffix: true })}
              </div>
            </li>

            {/* Conditionally show the rest of the pints (which also have buttons) */}
            {isExpanded && venue.pints
              .filter(pint => pint.id !== cheapestPint.id) // Exclude the cheapest, we already showed it
              .sort((a, b) => a.price - b.price) // Sort the rest for consistent order
              .map(pint => (
                <li key={pint.id} style={{ borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{pint.beer_name} - <strong>${pint.price.toFixed(2)}</strong></span>
                    
                    <div>
                      <Link href={`/pints/${pint.id}/edit`} passHref>
                        <button onClick={(e) => e.stopPropagation()} className="mini-button">
                          Edit
                        </button>
                      </Link>
                      <button onClick={(e) => { e.stopPropagation(); onDeletePint(pint.id); }} className="mini-button-delete">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                    Updated {formatDistanceToNow(new Date(pint.updated_at || pint.created_at), { addSuffix: true })}
                  </div>
                </li>
              ))
            }
          </ul>
        ) : (
          <p className={styles.venueDetails} style={{ fontStyle: 'italic', marginTop: '10px' }}>
            No specific pint prices listed.
          </p>
        )}

        {/* Toggle button only shows if there are more than 1 pint */}
        {venue.pints && venue.pints.length > 1 && (
          <button onClick={handleToggleExpand} className={styles.toggleButton}>
            {isExpanded ? 'Show Less' : `Show ${venue.pints.length - 1} More...`}
          </button>
        )}
      </div>
      
      {/* "Add Beer/Price" button for the venue */}
      <div style={{ textAlign: 'right', marginTop: '15px' }}>
        <Link href={`/venues/${venue.id}/add-pint`} passHref>
          <button onClick={(e) => e.stopPropagation()} className="add-pint-button">
            + Add Beer/Price
          </button>
        </Link>
      </div>

      {/* Basic styling for buttons */}
      <style jsx>{`
        .mini-button, .mini-button-delete, .add-pint-button {
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          margin-left: 5px;
        }
        .mini-button { background-color: #ffc107; color: black; }
        .mini-button-delete { background-color: #dc3545; color: white; }
        .add-pint-button { background-color: #17a2b8; color: white; padding: 5px 10px;}
      `}</style>
    </div>
  );
}