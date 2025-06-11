// src/app/venues/add/page.js
'use client';

import { MELBOURNE_SUBURBS } from '@/data/suburbs';
import { useState, useEffect } from 'react';
import Select from 'react-select';
import { supabase } from '../../../../supabaseClient'; // Verify this path
import { useRouter } from 'next/navigation';
import styles from '../../../styles/Form.module.css'; // <-- 1. Import the new CSS module

export default function AddVenuePage() {
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [priceValue, setPriceValue] = useState('');
  const [suburb, setSuburb] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isErrorMessage, setIsErrorMessage] = useState(false);
  const router = useRouter();


  const handleSubmit = async (e) => {
    // ... (your handleSubmit function logic remains exactly the same) ...
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setIsErrorMessage(false);

    if (!venueName.trim() || !address.trim() || !priceValue.trim() || !suburb) {
      setMessage('Please fill in all fields, including the suburb.');
      setIsErrorMessage(true);
      setSubmitting(false);
      return;
    }

    const numPrice = parseFloat(priceValue);
    if (isNaN(numPrice) || numPrice <= 0) {
      setMessage('Please enter a valid positive price.');
      setIsErrorMessage(true);
      setSubmitting(false);
      return;
    }

    try {
      setMessage('Finding coordinates for the address...');
      const geocodingUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

      const geocodingResponse = await fetch(geocodingUrl);
      const geocodingData = await geocodingResponse.json();

      if (!geocodingResponse.ok || geocodingData.length === 0) {
        throw new Error('Address not found. Please check the address and try again.');
      }

      const { lat, lon } = geocodingData[0];
      setMessage('Saving venue...');

      const newVenue = {
        name: venueName.trim(),
        address: address.trim(),
        suburb: suburb,
        price_value: numPrice, 
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };

      const { data, error } = await supabase
        .from('venues')
        .insert([newVenue])
        .select();

      if (error) throw error;

      setMessage('Venue added successfully!');
      setIsErrorMessage(false);

      setTimeout(() => {
        router.push('/venues'); 
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error.message);
      setMessage(`Error: ${error.message}`);
      setIsErrorMessage(true);
    } finally {
      setSubmitting(false);
    }
  };

  const suburbOptions = MELBOURNE_SUBURBS.map(s => ({ value: s, label: s }));

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
          <label htmlFor="suburb" className={styles.label}>Suburb:</label>
          <Select
            instanceId="suburb-select"
            id="suburb"
            options={suburbOptions}
            onChange={(selectedOption) => setSuburb(selectedOption ? selectedOption.value : '')}
            value={suburbOptions.find(option => option.value === suburb)}
            placeholder="Type or select a suburb..."
            isClearable
            required
            // You might need to add some basic styling for react-select
            styles={{
              control: (base) => ({
                ...base,
                minHeight: '42px', // Match your other input fields
              }),
            }}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address" className={styles.label}>Full Address:</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="e.g., 57 Swan Street, Richmond, VIC 3121"
            className={styles.inputField}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="priceValue" className={styles.label}>Average Price (e.g., 10.50):</label>
          <input
            type="number"
            id="priceValue"
            value={priceValue}
            onChange={(e) => setPriceValue(e.target.value)}
            step="0.01"
            required
            className={styles.inputField}
          />
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className={styles.submitButton}
        >
          {submitting ? 'Finding & Saving...' : 'Add Venue'}
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