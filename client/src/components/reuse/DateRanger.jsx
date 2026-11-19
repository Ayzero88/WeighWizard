import React, { useState } from 'react'
import { FaSearch } from 'react-icons/fa';
import { BaseUrl } from './BaseUrl';

const DateRanger = ({ setTransactions, showAlert, setIsLoading3 }) => {
  const [advance, setAdvance] = useState({
    start: "",
    end: "",
  });

  const handleAdvance = (e) => {
    const { name, value } = e.target;
    setAdvance(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toISO = (dateStr, isEnd = false) => {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    if (isEnd) date.setHours(23, 59, 59, 999);
    return date.toISOString();
  };

  const handleSearchTransactions = async () => {
    try {
      setIsLoading3(true);
      const payload = {};

      if (advance.start) payload.startDate = toISO(advance.start);
      if (advance.end) payload.endDate = toISO(advance.end, true);

      const response = await fetch(
         `${BaseUrl}/transactions/filter-by-date`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setTransactions(data); 
      setIsLoading3(false);

    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      showAlert("Failed to fetch transactions.", "error");
      setIsLoading3(false);
    }
  };

  const currentDateFormat = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="advance">
      <input
        type="date"
        name="start"
        value={advance.start}
        onChange={handleAdvance}
        max={currentDateFormat()}
      />
      <input
        type="date"
        name="end"
        value={advance.end}
        onChange={handleAdvance}
        max={currentDateFormat()}
      />
      <FaSearch cursor="pointer" onClick={handleSearchTransactions} />
    </div>
  );
};

export default DateRanger;
