import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <label className="search-bar__label" htmlFor="listing-search">
        Search
      </label>
      <input
        id="listing-search"
        className="search-bar__input"
        type="search"
        placeholder="Search by city or listing"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
