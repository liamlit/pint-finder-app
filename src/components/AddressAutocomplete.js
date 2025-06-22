// src/components/AddressAutocomplete.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/Form.module.css'; // We'll use the same form styles

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export default function AddressAutocomplete({ onAddressSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced fetch function
  const debouncedFetch = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchQuery)}&countrycodes=au&addressdetails=1&limit=5`;
        const response = await fetch(url);
        const data = await response.json();
        setSuggestions(data);
        setActiveIndex(-1);
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400),
    []
  );

  useEffect(() => {
    debouncedFetch(query);
  }, [query, debouncedFetch]);

  const handleSelect = (address) => {
    setQuery(address.display_name);
    setSuggestions([]);
    onAddressSelect(address); // Pass selected address to parent
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeIndex > -1) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
    }
  };

  return (
    <div className={styles.formGroup}>
      <label htmlFor="address" className={styles.label}>Address:</label>
      <input
        type="text"
        id="address"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        required
        placeholder="Start typing an address..."
        className={styles.inputField}
        autoComplete="off"
      />
      {isSearching && <div className={styles.loader}></div>}
      {suggestions.length > 0 && (
        <ul className={styles.suggestionsList}>
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
              className={`${styles.suggestionItem} ${index === activeIndex ? styles.active : ''}`}
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}