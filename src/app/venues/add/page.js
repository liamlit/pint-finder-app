// src/app/venues/add/page.js
'use client';

import { useState } from 'react';
import { supabase } from '../../../../supabaseClient'; // Verify this path
import { useRouter } from 'next/navigation'; // To redirect after submission

export default function AddVenuePage() {
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [priceValue, setPriceValue] = useState(''); // For price_value (numeric)
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isErrorMessage, setIsErrorMessage] = useState(false); // For success/error messages
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission which reloads the page
    setSubmitting(true);
    setMessage('');
    setIsErrorMessage(false);

    // Basic validation (can be expanded)
    if (!venueName || !address || !priceValue || !latitude || !longitude) {
      setMessage('Please fill in all fields.');
      setIsErrorMessage(true);
      setSubmitting(false);
      return;
    }

    const newVenue = {
      name: venueName,
      address: address,
      // Ensure priceValue is a number, latitude and longitude too
      price_value: parseFloat(priceValue), 
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      // created_at will be set by Supabase default
    };

    console.log('Submitting new venue:', newVenue);

    const { data, error } = await supabase
      .from('venues')
      .insert([newVenue])
      .select(); // .select() can be useful to get back the inserted data

    if (error) {
      console.error('Error inserting venue:', error.message);
      setMessage(`Error adding venue: ${error.message}`);
      setIsErrorMessage(true);
    } else {
      console.log('Venue added successfully:', data);
      setMessage('Venue added successfully!');
      setIsErrorMessage(false);
      // Optionally, clear the form
      setVenueName('');
      setAddress('');
      setPriceValue('');
      setLatitude('');
      setLongitude('');
      // Optionally, redirect the user after a short delay
       setTimeout(() => {
         router.push('/venues'); 
       }, 2000);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h1>Add New PintFinder Venue</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="venueName" style={{ display: 'block', marginBottom: '5px' }}>Venue Name:</label>
          <input
            type="text"
            id="venueName"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="address" style={{ display: 'block', marginBottom: '5px' }}>Address:</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="priceValue" style={{ display: 'block', marginBottom: '5px' }}>Average Price (e.g., 10.50):</label>
          <input
            type="number" // Use type "number" for numeric input
            id="priceValue"
            value={priceValue}
            onChange={(e) => setPriceValue(e.target.value)}
            step="0.01" // Allows decimals
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="latitude" style={{ display: 'block', marginBottom: '5px' }}>Latitude:</label>
          <input
            type="number"
            id="latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            step="any" // Allows any decimal for coordinates
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="longitude" style={{ display: 'block', marginBottom: '5px' }}>Longitude:</label>
          <input
            type="number"
            id="longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            step="any"
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          style={{ padding: '10px 15px', backgroundColor: submitting ? '#ccc' : '#0070f3', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {submitting ? 'Adding Venue...' : 'Add Venue'}
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', color: isErrorMessage ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}