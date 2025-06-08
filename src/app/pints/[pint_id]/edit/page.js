// src/app/pints/[pint_id]/edit/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../../supabaseClient'; // Verify this path
import { useRouter, useParams } from 'next/navigation';

export default function EditPintPage() {
  const [beerName, setBeerName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isErrorMessage, setIsErrorMessage] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const pintId = params.pint_id; // Get the pint ID from the URL

  // Fetch the current pint data when the component mounts
  const fetchPintData = useCallback(async () => {
    if (!pintId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('pints')
      .select('beer_name, price')
      .eq('id', pintId)
      .single();

    if (error) {
      console.error('Error fetching pint data:', error);
      setMessage('Could not load pint data.');
      setIsErrorMessage(true);
    } else if (data) {
      setBeerName(data.beer_name);
      setPrice(data.price);
    }
    setLoading(false);
  }, [pintId]);

  useEffect(() => {
    fetchPintData();
  }, [fetchPintData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setIsErrorMessage(false);

    // Basic Validation
    if (!beerName.trim() || !String(price).trim()) {
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

    const updatedPint = {
      beer_name: beerName.trim(),
      price: numPrice,
    };

    const { error } = await supabase
      .from('pints')
      .update(updatedPint)
      .eq('id', pintId); // Specify which pint to update

    if (error) {
      setMessage(`Error updating pint: ${error.message}`);
      setIsErrorMessage(true);
    } else {
      setMessage('Pint updated successfully!');
      setIsErrorMessage(false);
      setTimeout(() => {
        router.push('/venues'); // Redirect back to the main list
      }, 1500);
    }
    setSubmitting(false);
  };

  if (loading) {
    return <p>Loading pint details...</p>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h1>Edit Pint</h1>
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
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', color: isErrorMessage ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}