import React from "react";

const FormatDateTime = ({ isoString }) => {
  if (!isoString) return "Invalid Date";

  const date = new Date(isoString);
  const formattedDate = date.toLocaleString("en-GB", {
    timeZone: "Africa/Lagos", // Set to WAT (UTC+1)
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return <span>{formattedDate}</span>;
};

export default FormatDateTime;
