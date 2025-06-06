// src/app/venues/[id]/add-pint/page.js
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../supabaseClient'; // Verify path
import { useRouter, useParams } from 'next/navigation';

// This component receives 'params' as a prop, which contains the dynamic route segments.
// In this case, params.id will be the venue's ID from the URL.
export default function AddPintPage() {
  const params = useParams();
  const venueId = params.id;
  const [venueName, setVenueName] = useState('');
  const [beerName, setBeerName] = useState('');
  const [price, setPrice] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isErrorMessage, setIsErrorMessage] = useState(false);
  const router = useRouter();
 

  // Fetch the venue's name to display it on the page
  useEffect(() => {
    if (venueId) {
      const fetchVenueName = async () => {
        const { data, error } = await supabase
          .from('venues')
          .select('name')
          .eq('id', venueId)
          .single();

        if (error) {
          console.error("Error fetching venue name:", error);
        } else {
          setVenueName(data.name);
        }
      };
      fetchVenueName();
    }
  }, [venueId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setIsErrorMessage(false);

    if (!beerName.trim() || !price.trim()) {
      setMessage('Please fill in all fields.');
      setIsErrorMessage(true);
      setSubmitting(false);
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setMessage('Please enter a valid positive price.');
      setIsErrorMessage(true);
      setSubmitting(false);
      return;
    }

    const newPint = {
      beer_name: beerName.trim(),
      price: numPrice,
      venue_id: venueId, // Link this pint to the correct venue
    };

    const { error } = await supabase.from('pints').insert([newPint]);

    if (error) {
      setMessage(`Error adding pint: ${error.message}`);
      setIsErrorMessage(true);
    } else {
      setMessage('Pint added successfully!');
      setIsErrorMessage(false);
      setTimeout(() => {
        router.push('/venues'); // Redirect back to the main list
      }, 1500);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h1>Add Pint for: <span style={{ color: '#0070f3' }}>{venueName || '...'}</span></h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="beerName" style={{ display: 'block', marginBottom: '5px' }}>Beer Name:</label>
          <input
            type="text"
            id="beerName"
            value={beerName}
            onChange={(e) => setBeerName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="price" style={{ display: 'block', marginBottom: '5px' }}>Price:</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={submitting}
          style={{ padding: '10px 15px', backgroundColor: submitting ? '#ccc' : '#0070f3', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {submitting ? 'Adding...' : 'Add Pint'}
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', color: isErrorMessage ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}