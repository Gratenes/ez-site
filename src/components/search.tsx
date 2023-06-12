import React, { useState } from 'react';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
    // You can implement the search functionality here and update the UI accordingly
  };

  const handleKeyDown = (e: { key: string; }) => {
    if (e.key === "Enter") {
     
    }
  };

  const handlePaste = (e: { clipboardData: { getData: (arg0: string) => any; }; }) => {
    const pastedText = e.clipboardData.getData("text");
    setSearchTerm(pastedText);
  };

  return (
    <div className="bg-transparent rounded-token border border-primary">
      <form onSubmit={handleSearch}>
        <input
          className="bg-transparent rounded-token border-0"
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
};

export default Search;
