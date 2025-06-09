// src/app/pints/[pint_id]/edit/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../../supabaseClient'; // Verify path
import { useRouter, useParams } from 'next/navigation';
import styles from '../../../../styles/Form.module.css'; // <-- 1. Import the shared CSS module

export default function EditPintPage() {
  const [beerName, setBeerName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isErrorMessage, setIsErrorMessage] = useState(false);

  const router = useRouter();
  const params = useParams();
  const pintId = params.pint_id;

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
      .eq('id', pintId);

    if (error) {
      setMessage(`Error updating pint: ${error.message}`);
      setIsErrorMessage(true);
    } else {
      setMessage('Pint updated successfully!');
      setIsErrorMessage(false);
      setTimeout(() => {
        router.push('/venues');
      }, 1500);
    }
    setSubmitting(false);
  };

  if (loading) {
    return <p>Loading pint details...</p>;
  }

  // --- 2. UPDATE THE JSX WITH CLASSNAMES ---
  return (
    <div className={styles.formContainer}>
      <h1>Edit Pint</h1>
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
          disabled={submitting || loading}
          className={styles.submitButton}
        >
          {submitting ? 'Saving...' : 'Save Changes'}
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