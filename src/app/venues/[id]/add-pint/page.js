// src/app/venues/[id]/add-pint/page.js
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../supabaseClient'; // Verify path
import { useRouter, useParams } from 'next/navigation';
import styles from '../../../../styles/Form.module.css'; // <-- 1. Import the shared CSS module

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
        } else if (data) {
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
      venue_id: venueId,
    };

    const { error } = await supabase.from('pints').insert([newPint]);

    if (error) {
      setMessage(`Error adding pint: ${error.message}`);
      setIsErrorMessage(true);
    } else {
      setMessage('Pint added successfully!');
      setIsErrorMessage(false);
      setTimeout(() => {
        router.push('/venues');
      }, 1500);
    }
    setSubmitting(false);
  };

  // --- 2. UPDATE THE JSX WITH CLASSNAMES ---
  return (
    <div className={styles.formContainer}>
      <h1>Add Pint for: <span style={{ color: 'var(--primary-color)' }}>{venueName || '...'}</span></h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="beerName" className={styles.label}>Beer Name:</label>
          <input
            type="text"
            id="beerName"
            value={beerName}
            onChange={(e) => setBeerName(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="price" className={styles.label}>Price:</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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
          {submitting ? 'Adding...' : 'Add Pint'}
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