// src/app/venues/add/page.js
'use client';

import { useState, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient'; // Verify this path
import { useRouter } from 'next/navigation';
import styles from '../../../styles/Form.module.css'; // <-- 1. Import the new CSS module
import AddressAutocomplete from '@/components/AddressAutocomplete';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export default function AddVenuePage() {
  const [venueName, setVenueName] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState('');
  const [isErrorMessage, setIsErrorMessage] = useState(false);
  const router = useRouter();

  const fetchAddressSuggestions = async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const geocodingUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&countrycodes=au&addressdetails=1&limit=5`;
      const response = await fetch(geocodingUrl);
      const data = await response.json();
      setAddressSuggestions(data);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setAddressSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchAddressSuggestions, 500), []);

  const handleAddressChange = (e) => {
    const query = e.target.value;
    setAddressQuery(query);
    setSelectedAddress(null); // Clear selected address if user types again
    debouncedFetch(query);
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setAddressQuery(address.display_name);
    setAddressSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setIsErrorMessage(false);

    if (!venueName.trim() || !selectedAddress) {
      setMessage('Please enter a venue name and select a valid address from the suggestions.');
      setIsErrorMessage(true);
      setSubmitting(false);
      return;
    }


    try {
      setMessage('Saving venue...');
      
      // Extract suburb. OSM data can be inconsistent, so we check multiple fields.
      const suburb = selectedAddress.address.suburb || selectedAddress.address.city_district || selectedAddress.address.city || selectedAddress.address.town || 'Unknown';

      const newVenue = {
        name: venueName.trim(),
        address: selectedAddress.display_name,
        suburb: suburb,
        latitude: parseFloat(selectedAddress.lat),
        longitude: parseFloat(selectedAddress.lon),
      };

      const { data, error } = await supabase
        .from('venues')
        .insert([newVenue])
        .select();

      if (error) throw error;  

      const newVenueId = data[0].id;
      setMessage('Venue added successfully! Redirecting to add a pint...');
      setIsErrorMessage(false);

      setTimeout(() => {
        router.push(`/venues/${newVenueId}/add-pint`); 
      }, 1500);

    } catch (error) {
      console.error('Submission error:', error.message);
      setMessage(`Error: ${error.message}`);
      setIsErrorMessage(true);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className={styles.formContainer}>
      <h1>Add New Venue</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="venueName" className={styles.label}>Venue Name:</label>
          <input
            type="text"
            id="venueName"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address" className={styles.label}>Address:</label>
          <input
            type="text"
            id="address"
            value={addressQuery}
            onChange={handleAddressChange}
            required
            placeholder="Start typing an address..."
            className={styles.inputField}
            autoComplete="off"
          />
          {isSearching && <p>Searching...</p>}
          {addressSuggestions.length > 0 && (
            <ul className={styles.suggestionsList}>
              {addressSuggestions.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  onClick={() => handleSelectAddress(suggestion)}
                  className={styles.suggestionItem}
                >
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button 
          type="submit" 
          disabled={submitting || !selectedAddress}
          className={styles.submitButton}
        >
          {submitting ? 'Saving...' : 'Continue to Add Beer'}
        </button>
      </form>
      {message && (
        <p className={`${styles.message} ${isErrorMessage ? styles.error : styles.success}`}>
          {message}
        </p>
      )}
    </div>
  );
}