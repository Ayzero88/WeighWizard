import { useEffect, useState } from "react";
import axios from "axios";
import useWebSocket from "./useWebSocket";
import { BaseUrl } from "../../reuse/BaseUrl";

const ScaleReader = ({ wsUrl }) => {
  const [scaleConfig, setScaleConfig] = useState(null);

  // 🔹 Fetch capacity & resolution ONCE
  useEffect(() => {
    axios.get(`${BaseUrl}/print-type`)
      .then(res => {
        const data = res.data;
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
