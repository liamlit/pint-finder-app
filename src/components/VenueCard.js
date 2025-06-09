// src/components/VenueCard.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
// --- 1. IMPORT THE SHARED STYLES ---
import styles from '@/app/venues/VenuesPage.module.css';

export default function VenueCard({ venue, onVenueSelect, onDeletePint }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
      <div onClick={() => onVenueSelect(venue)} style={{cursor: 'pointer'}}>
        <h2 className={styles.venueName}>{venue.name}</h2>
        <p className={styles.venueDetails}>
          <strong>Address:</strong> {venue.address || 'N/A'}
        </p>
      </div>

      <div style={{ marginTop: '10px' }}>
        {cheapestPint ? (
          <ul style={{ listStyleType: 'none', paddingLeft: '0', margin: '0' }}>

            {/* --- 2. APPLY NEW CLASSES TO THE BUTTONS --- */}
            {/* Always show the cheapest pint WITH styled buttons */}
            <li style={{ borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  Cheapest: {cheapestPint.beer_name} - <strong>${cheapestPint.price.toFixed(2)}</strong>
                </span>
                <div>
                  <Link href={`/pints/${cheapestPint.id}/edit`} passHref>
                    <button onClick={(e) => e.stopPropagation()} className={`${styles.controlButton} ${styles.editButton} ${styles.mini}`}>
                      Edit
                    </button>
                  </Link>
                  <button onClick={(e) => { e.stopPropagation(); onDeletePint(cheapestPint.id); }} className={`${styles.controlButton} ${styles.deleteButton} ${styles.mini}`}>
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                Updated {formatDistanceToNow(new Date(cheapestPint.updated_at || cheapestPint.created_at), { addSuffix: true })}
              </div>
            </li>

            {/* Conditionally show the rest of the pints */}
            {isExpanded && venue.pints
              .filter(pint => pint.id !== cheapestPint.id) 
              .sort((a, b) => a.price - b.price)
              .map(pint => (
                <li key={pint.id} style={{ borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{pint.beer_name} - <strong>${pint.price.toFixed(2)}</strong></span>
                    <div>
                      <Link href={`/pints/${pint.id}/edit`} passHref>
                        <button onClick={(e) => e.stopPropagation()} className={`${styles.controlButton} ${styles.editButton} ${styles.mini}`}>
                          Edit
                        </button>
                      </Link>
                      <button onClick={(e) => { e.stopPropagation(); onDeletePint(pint.id); }} className={`${styles.controlButton} ${styles.deleteButton} ${styles.mini}`}>
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

        {venue.pints && venue.pints.length > 1 && (
          <button 
            onClick={handleToggleExpand} 
            className={styles.toggleButton}  // <-- ADD THIS CLASSNAME
        >
            {isExpanded ? 'Show Less' : `Show ${venue.pints.length - 1} More...`}
             </button>
        )}
      </div>

      <div style={{ textAlign: 'right', marginTop: '15px' }}>
        <Link href={`/venues/${venue.id}/add-pint`} passHref>
          <button onClick={(e) => e.stopPropagation()} className={`${styles.controlButton} ${styles.addPintButton}`}>
            + Add Beer/Price
          </button>
        </Link>
      </div>

      {/* --- 3. DELETE THE <style jsx> BLOCK --- */}
    </div>
  );
}