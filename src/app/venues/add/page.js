// src/app/venues/add/page.js
'use client';

import { useState } from 'react';
import { supabase } from '../../../../supabaseClient'; // Verify this path
import { useRouter } from 'next/navigation'; // To redirect after submission

export default function AddVenuePage() {
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [priceValue, setPriceValue] = useState(''); // For price_value (numeric)

  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isErrorMessage, setIsErrorMessage] = useState(false); // For success/error messages
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission which reloads the page
    setSubmitting(true);
    setMessage('');
    setIsErrorMessage(false);

    // Basic validation for fields the user fills out
    if (!venueName.trim() || !address.trim() || !priceValue.trim()) {
        setMessage('Please fill in all fields.');
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
        console.log('Geocoding URL:', geocodingUrl);
        
        const geocodingResponse = await fetch(geocodingUrl);
        const geocodingData = await geocodingResponse.json();
  
        if (!geocodingResponse.ok || geocodingData.length === 0) {
          throw new Error('Address not found. Please check the address and try again.');
        }
        
        const { lat, lon } = geocodingData[0]; // Get lat/lon from the first result
        console.log('Geocoded coordinates:', { lat, lon });
  
        // --- END GEOCODING STEP ---

   // --- SUPABASE INSERT STEP ---
   setMessage('Saving venue...');

   const newVenue = {
     name: venueName.trim(),
     address: address.trim(),
     price_value: numPrice, 
     latitude: parseFloat(lat),  // Use geocoded latitude
     longitude: parseFloat(lon), // Use geocoded longitude
   };

   const { data, error } = await supabase
     .from('venues')
     .insert([newVenue])
     .select();

   if (error) {
     throw new Error(error.message); // Throw error to be caught below
   }

   console.log('Venue added successfully:', data);
   setMessage('Venue added successfully!');
   setIsErrorMessage(false);
   
   setVenueName('');
   setAddress('');
   setPriceValue('');

   setTimeout(() => {
     router.push('/venues'); 
   }, 2000);

 } catch (error) {
   // Catch errors from either geocoding or Supabase insert
   console.error('Submission error:', error.message);
   setMessage(`Error: ${error.message}`);
   setIsErrorMessage(true);
 } finally {
   setSubmitting(false); // Ensure this runs even if there's an error
 }
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
       <label htmlFor="address" style={{ display: 'block', marginBottom: '5px' }}>Full Address:</label>
       <input
         type="text"
         id="address"
         value={address}
         onChange={(e) => setAddress(e.target.value)}
         required
         placeholder="e.g., 57 Swan Street, Richmond, VIC 3121"
         style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
       />
     </div>

     <div style={{ marginBottom: '10px' }}>
       <label htmlFor="priceValue" style={{ display: 'block', marginBottom: '5px' }}>Average Price (e.g., 10.50):</label>
       <input
         type="number"
         id="priceValue"
         value={priceValue}
         onChange={(e) => setPriceValue(e.target.value)}
         step="0.01"
         required
         style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
       />
     </div>
     
     {/* Latitude and Longitude inputs have been removed */}

     <button 
       type="submit" 
       disabled={submitting}
       style={{ padding: '10px 15px', backgroundColor: submitting ? '#ccc' : '#0070f3', color: 'white', border: 'none', cursor: 'pointer' }}
     >
       {submitting ? 'Finding & Saving...' : 'Add Venue'}
     </button>
   </form>
   {message && <p style={{ marginTop: '15px', color: isErrorMessage ? 'red' : 'green' }}>{message}</p>}
 </div>
);
}