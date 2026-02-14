import React, { useState } from 'react'
import { FaSearch } from 'react-icons/fa';

const DateRanger = ({ setTransactions }) => {

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
      const payload = {};

      if (advance.start) payload.startDate = toISO(advance.start);
      if (advance.end) payload.endDate = toISO(advance.end, true);

      const response = await fetch(
        "http://localhost:8080/transactions/filter-by-date",
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
      setTransactions(data); // ✅ backend returns List<Transaction>

    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      alert("Failed to fetch transactions.");
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
