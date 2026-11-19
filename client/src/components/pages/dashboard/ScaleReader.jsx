import { useEffect, useState } from "react";
import useWebSocket from "./useWebSocket";
import { BaseUrl } from "../../reuse/BaseUrl";

const ScaleReader = ({ wsUrl }) => {
  const [scaleConfig, setScaleConfig] = useState(null);

  // 🔹 Fetch capacity & resolution ONCE
  useEffect(() => {
    fetch(`${BaseUrl}/print-type`)
      .then(res => res.json())
      .then(data => {
        setScaleConfig({
          capacity: data.capacity,
          resolution: data.resolution,
          adjustDecimal: data.adjustDecimal
        });
      })
      .catch(err => console.error(err));
  }, []);

  // 🔹 Pass DB values INTO the hook
  const { weight } = useWebSocket({
    url: wsUrl,
    capacity: scaleConfig?.capacity,
    resolution: scaleConfig?.resolution
  });

  return (
    <div>
      <h2>Weight</h2>
      <p>{weight ?? "Not Connected"}</p>
    </div>
  );
};

export default ScaleReader;
